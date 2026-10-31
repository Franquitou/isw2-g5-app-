import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSession } from '@/auth/SessionContext';
import { AppScreen, InfoRow, SectionCard } from '@/components';
import { ActionButton } from '@/features/auth/components/ActionButton';
import { catalogApi } from '@/features/catalog';
import {
  ETIQUETA_EVENTO,
  TRANSICIONES,
  confirmarAccion,
  formatearFechaHora,
  partidoError,
  partidosApi,
} from '@/features/partidos';
import type { Transicion } from '@/features/partidos';
import { colors, radii, spacing, typography } from '@/theme';
import type { Arbitro, Cancha, Equipo, Evento, EstadoPartido, Jugador, PartidoDetalle } from '@/types';

/**
 * RF-10: detalle público con resultado y eventos. Un ADMIN o DELEGADO además puede
 * cambiar el estado y, mientras el partido está EN_JUEGO, registrar o corregir eventos.
 */
export default function PartidoDetalleScreen() {
  const { partidoId } = useLocalSearchParams<{ partidoId?: string }>();
  const partidoNumero = Number(partidoId);
  const { session } = useSession();
  const [partido, setPartido] = useState<PartidoDetalle | null>(null);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [arbitros, setArbitros] = useState<Arbitro[]>([]);
  const [jugadoresLocal, setJugadoresLocal] = useState<Jugador[]>([]);
  const [jugadoresVisitante, setJugadoresVisitante] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const cargar = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError(null);
    if (!Number.isInteger(partidoNumero) || partidoNumero <= 0) {
      setPartido(null);
      setError('El identificador del partido no es válido.');
      setLoading(false);
      return;
    }
    try {
      const detalle = await partidosApi.detalle(partidoNumero);
      if (currentRequest !== requestId.current) return;
      const [listaEquipos, listaCanchas, listaArbitros, locales, visitantes] = await Promise.all([
        catalogApi.listarEquipos(detalle.torneoId),
        catalogApi.listarCanchas(),
        catalogApi.listarArbitros(),
        catalogApi.listarJugadores(detalle.equipoLocalId),
        catalogApi.listarJugadores(detalle.equipoVisitanteId),
      ]);
      if (currentRequest !== requestId.current) return;
      setPartido(detalle);
      setEquipos(listaEquipos);
      setCanchas(listaCanchas);
      setArbitros(listaArbitros);
      setJugadoresLocal(locales);
      setJugadoresVisitante(visitantes);
    } catch (failure) {
      if (currentRequest === requestId.current) setError(partidoError(failure));
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [partidoNumero]);

  useFocusEffect(useCallback(() => {
    void cargar();
    return () => { requestId.current++; };
  }, [cargar]));

  const nombresEquipos = useMemo(
    () => new Map(equipos.map((equipo) => [equipo.id, equipo.nombre])),
    [equipos],
  );
  const nombresJugadores = useMemo(() => {
    const mapa = new Map<number, string>();
    for (const jugador of [...jugadoresLocal, ...jugadoresVisitante]) {
      mapa.set(
        jugador.id,
        `${jugador.apellido}, ${jugador.nombre}${jugador.numeroCamiseta ? ` (#${jugador.numeroCamiseta})` : ''}`,
      );
    }
    return mapa;
  }, [jugadoresLocal, jugadoresVisitante]);

  const puedeOperar = session?.rol === 'ADMIN' || session?.rol === 'DELEGADO';
  const esAdmin = session?.rol === 'ADMIN';
  const torneoId = partido?.torneoId ?? null;

  async function cambiarEstado(estado: EstadoPartido) {
    setSaving(true);
    setError(null);
    try {
      await partidosApi.cambiarEstado(partidoNumero, estado);
      await cargar();
    } catch (failure) {
      setError(partidoError(failure));
    } finally {
      setSaving(false);
    }
  }

  function aplicarTransicion(transicion: Transicion) {
    if (transicion.confirmacion === null) {
      void cambiarEstado(transicion.estado);
      return;
    }
    confirmarAccion(transicion.etiqueta, transicion.confirmacion, () => { void cambiarEstado(transicion.estado); });
  }

  function confirmarBajaPartido() {
    confirmarAccion(
      'Eliminar el partido',
      'Solo se puede eliminar un partido PROGRAMADO. Esta acción no se puede deshacer.',
      async () => {
        setSaving(true);
        setError(null);
        try {
          await partidosApi.eliminar(partidoNumero);
          router.replace({
            pathname: '/partidos',
            params: torneoId
              ? { torneoId: String(torneoId), fecha: String(partido?.numeroFecha ?? 1) }
              : {},
          });
        } catch (failure) {
          setError(partidoError(failure));
          setSaving(false);
        }
      },
    );
  }

  function confirmarBajaEvento(evento: Evento) {
    confirmarAccion(
      'Eliminar evento',
      'Se quitará del partido y el marcador se recalculará.',
      async () => {
        setSaving(true);
        setError(null);
        try {
          await partidosApi.eliminarEvento(partidoNumero, evento.id);
          await cargar();
        } catch (failure) {
          setError(partidoError(failure));
        } finally {
          setSaving(false);
        }
      },
    );
  }

  return (
    <AppScreen>
      <SectionCard title="Partido" subtitle="RF-10 · detalle público">
        {loading ? <ActivityIndicator color={colors.primary} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!loading && !error && !partido ? (
          <Text style={styles.muted}>El partido no existe.</Text>
        ) : null}

        {partido ? (
          <>
            <View style={styles.marcador}>
              <View style={styles.columnaEquipo}>
                <Text style={styles.equipo} numberOfLines={2}>
                  {nombresEquipos.get(partido.equipoLocalId) ?? `Equipo #${partido.equipoLocalId}`}
                </Text>
                <Text style={styles.caption}>Local</Text>
              </View>
              <Text style={styles.score}>
                {partido.estado === 'PROGRAMADO'
                  ? 'vs'
                  : `${partido.resultado.golesLocal} - ${partido.resultado.golesVisitante}`}
              </Text>
              <View style={[styles.columnaEquipo, styles.columnaDerecha]}>
                <Text style={[styles.equipo, styles.textoDerecha]} numberOfLines={2}>
                  {nombresEquipos.get(partido.equipoVisitanteId) ?? `Equipo #${partido.equipoVisitanteId}`}
                </Text>
                <Text style={[styles.caption, styles.textoDerecha]}>Visitante</Text>
              </View>
            </View>

            <InfoRow label="Estado" value={partido.estado.replace('_', ' ').toLowerCase()} />
            <InfoRow label="Jornada" value={`Fecha ${partido.numeroFecha}`} />
            <InfoRow label="Inicio" value={formatearFechaHora(partido.fechaHoraInicio)} />
            <InfoRow
              label="Cancha"
              value={canchas.find((cancha) => cancha.id === partido.canchaId)?.nombre ?? `Cancha #${partido.canchaId}`}
            />
            <InfoRow
              label="Árbitro"
              value={(() => {
                const arbitro = arbitros.find((item) => item.id === partido.arbitroId);
                return arbitro ? `${arbitro.apellido}, ${arbitro.nombre}` : `Árbitro #${partido.arbitroId}`;
              })()}
            />
          </>
        ) : null}
      </SectionCard>

      {partido && puedeOperar ? (
        <SectionCard title="Acciones" subtitle="Según el estado del partido">
          {esAdmin && partido.estado === 'PROGRAMADO' ? (
            <>
              <ActionButton
                title="Editar partido"
                onPress={() => router.push({
                  pathname: '/partidos/[partidoId]/editar',
                  params: { partidoId: String(partidoNumero) },
                })}
              />
              <ActionButton
                title="Eliminar partido"
                onPress={confirmarBajaPartido}
                disabled={saving}
                secondary
              />
            </>
          ) : null}

          {TRANSICIONES[partido.estado].map((transicion, indice) => (
            <ActionButton
              key={transicion.estado}
              title={transicion.etiqueta}
              onPress={() => aplicarTransicion(transicion)}
              disabled={saving}
              secondary={indice > 0}
            />
          ))}

          {partido.estado === 'EN_JUEGO' ? (
            <ActionButton
              title="Agregar evento"
              onPress={() => router.push({
                pathname: '/partidos/[partidoId]/evento',
                params: { partidoId: String(partidoNumero) },
              })}
            />
          ) : null}
        </SectionCard>
      ) : null}

      {partido ? (
        <SectionCard title="Eventos" subtitle="RF-08 y RF-09">
          {partido.eventos.length === 0 ? (
            <Text style={styles.muted}>Sin eventos registrados.</Text>
          ) : null}
          {partido.eventos.map((evento) => (
            <View key={evento.id} style={styles.evento}>
              <View style={styles.eventoTexto}>
                <Text style={styles.jugador}>
                  {nombresJugadores.get(evento.jugadorId) ?? `Jugador #${evento.jugadorId}`}
                </Text>
                <Text style={styles.muted}>
                  {ETIQUETA_EVENTO[evento.tipo]} · minuto {evento.minuto}
                </Text>
              </View>
              {puedeOperar && partido.estado === 'EN_JUEGO' ? (
                <Pressable
                  accessibilityRole="button"
                  disabled={saving}
                  onPress={() => confirmarBajaEvento(evento)}
                >
                  <Text style={styles.eliminar}>Eliminar</Text>
                </Pressable>
              ) : null}
            </View>
          ))}
        </SectionCard>
      ) : null}

      {partido ? (
        <SectionCard title="Más resultados" subtitle="Mismo torneo">
          <ActionButton
            title="Tabla de posiciones"
            onPress={() => router.push({
              pathname: '/partidos/tabla',
              params: { torneoId: String(partido.torneoId) },
            })}
            secondary
          />
          <ActionButton
            title="Suspendidos de esta fecha"
            onPress={() => router.push({
              pathname: '/partidos/suspendidos',
              params: { torneoId: String(partido.torneoId), fecha: String(partido.numeroFecha) },
            })}
            secondary
          />
        </SectionCard>
      ) : null}

      {!loading && error ? (
        <ActionButton title="Reintentar" onPress={() => { void cargar(); }} secondary />
      ) : null}
      <ActionButton
        title="Volver al listado"
        onPress={() => {
          if (!partido) {
            router.replace('/partidos');
            return;
          }
          router.replace({
            pathname: '/partidos',
            params: {
              torneoId: String(partido.torneoId),
              fecha: String(partido.numeroFecha),
            },
          });
        }}
        secondary
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  marcador: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  columnaEquipo: { flex: 1, gap: spacing.xs },
  columnaDerecha: { alignItems: 'flex-end' },
  equipo: { ...typography.subtitle, color: colors.text },
  textoDerecha: { textAlign: 'right' },
  caption: { ...typography.caption, color: colors.textMuted, textTransform: 'uppercase' },
  score: { ...typography.title, color: colors.primaryDark, minWidth: 80, textAlign: 'center' },
  evento: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  eventoTexto: { flex: 1, gap: spacing.xs },
  jugador: { ...typography.label, color: colors.text },
  eliminar: { ...typography.label, color: colors.danger },
  muted: { ...typography.body, color: colors.textMuted },
  error: { ...typography.body, color: colors.danger },
});
