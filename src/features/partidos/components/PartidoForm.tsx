import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionButton } from '@/features/auth/components/ActionButton';
import { catalogApi } from '@/features/catalog';
import { colors, radii, spacing, typography } from '@/theme';
import type { Arbitro, Cancha, Equipo, Partido, PartidoWriteRequest, Torneo } from '@/types';
import { partidoError } from '../services/partidoError';
import { armarFechaHora, fechaDeHoy, separarFechaHora } from '../utils/partidoLabels';

interface Props {
  mode: 'create' | 'edit';
  initial?: Partido;
  torneoInicialId?: number | null;
  fechaInicial?: number | null;
  onSave: (values: PartidoWriteRequest) => Promise<void>;
}

/** Selector de una opción en forma de chip. */
function Chip({ activo, texto, onPress, disabled = false }: {
  activo: boolean;
  texto: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.chip, activo && styles.chipActivo, disabled && styles.chipDeshabilitado]}
    >
      <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>{texto}</Text>
    </Pressable>
  );
}

/**
 * Formulario de RF-06. El torneo, los equipos, la cancha y el árbitro se eligen de
 * los catálogos públicos; el backend vuelve a validar actividad, torneo y horarios.
 */
export function PartidoForm({ mode, initial, torneoInicialId, fechaInicial, onSave }: Props) {
  const torneoPreferido = initial?.torneoId
    ?? (torneoInicialId && torneoInicialId > 0 ? torneoInicialId : null);
  const jornadaPreferida = initial?.numeroFecha
    ?? (fechaInicial && fechaInicial > 0 ? fechaInicial : 1);
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [arbitros, setArbitros] = useState<Arbitro[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
  const [cargandoEquipos, setCargandoEquipos] = useState(false);
  const [torneoId, setTorneoId] = useState<number | null>(torneoPreferido);
  const [numeroFecha, setNumeroFecha] = useState(String(jornadaPreferida));
  const [localId, setLocalId] = useState<number | null>(initial?.equipoLocalId ?? null);
  const [visitanteId, setVisitanteId] = useState<number | null>(initial?.equipoVisitanteId ?? null);
  const [canchaId, setCanchaId] = useState<number | null>(initial?.canchaId ?? null);
  const [arbitroId, setArbitroId] = useState<number | null>(initial?.arbitroId ?? null);
  const [fecha, setFecha] = useState(initial ? separarFechaHora(initial.fechaHoraInicio).fecha : fechaDeHoy());
  const [hora, setHora] = useState(initial ? separarFechaHora(initial.fechaHoraInicio).hora : '18:00');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    setCargandoCatalogos(true);
    Promise.all([catalogApi.listarTorneos(), catalogApi.listarCanchas(), catalogApi.listarArbitros()])
      .then(([listaTorneos, listaCanchas, listaArbitros]) => {
        if (!activo) return;
        setTorneos(listaTorneos);
        setCanchas(listaCanchas);
        setArbitros(listaArbitros);
        setTorneoId((actual) => actual ?? listaTorneos[0]?.id ?? null);
      })
      .catch((failure) => { if (activo) setError(partidoError(failure)); })
      .finally(() => { if (activo) setCargandoCatalogos(false); });
    return () => { activo = false; };
  }, []);

  useEffect(() => {
    if (torneoId === null) {
      setEquipos([]);
      return;
    }
    let activo = true;
    setCargandoEquipos(true);
    catalogApi.listarEquipos(torneoId)
      .then((lista) => {
        if (!activo) return;
        setEquipos(lista);
        setLocalId((actual) => (lista.some((equipo) => equipo.id === actual) ? actual : null));
        setVisitanteId((actual) => (lista.some((equipo) => equipo.id === actual) ? actual : null));
      })
      .catch((failure) => { if (activo) setError(partidoError(failure)); })
      .finally(() => { if (activo) setCargandoEquipos(false); });
    return () => { activo = false; };
  }, [torneoId]);

  const nombreTorneo = useMemo(
    () => torneos.find((torneo) => torneo.id === torneoId)?.nombre ?? '',
    [torneos, torneoId],
  );

  async function submit() {
    const fechaLimpia = fecha.trim();
    const horaLimpia = hora.trim();
    const jornada = Number(numeroFecha);
    if (torneoId === null) {
      setError('Elegí un torneo.');
      return;
    }
    if (!Number.isInteger(jornada) || jornada < 1) {
      setError('La jornada debe ser un número entero desde 1.');
      return;
    }
    if (localId === null || visitanteId === null) {
      setError('Elegí el equipo local y el visitante.');
      return;
    }
    if (localId === visitanteId) {
      setError('El equipo local y el visitante deben ser distintos.');
      return;
    }
    if (canchaId === null || arbitroId === null) {
      setError('Elegí la cancha y el árbitro.');
      return;
    }
    const inicio = armarFechaHora(fechaLimpia, horaLimpia);
    if (inicio === null) {
      setError('Ingresá una fecha AAAA-MM-DD y una hora HH:mm válidas.');
      return;
    }

    setSending(true);
    setError(null);
    try {
      await onSave({
        torneoId,
        numeroFecha: jornada,
        equipoLocalId: localId,
        equipoVisitanteId: visitanteId,
        canchaId,
        arbitroId,
        fechaHoraInicio: inicio,
      });
    } catch (failure) {
      setError(partidoError(failure));
    } finally {
      setSending(false);
    }
  }

  if (cargandoCatalogos) {
    return <ActivityIndicator color={colors.primary} />;
  }

  return (
    <View style={styles.form}>
      <Text style={styles.label}>Torneo</Text>
      <View style={styles.chips}>
        {torneos.map((torneo) => (
          <Chip
            key={torneo.id}
            activo={torneoId === torneo.id}
            texto={torneo.nombre}
            onPress={() => { setTorneoId(torneo.id); setLocalId(null); setVisitanteId(null); }}
          />
        ))}
      </View>
      {torneos.length === 0 ? <Text style={styles.hint}>No hay torneos activos.</Text> : null}

      <Text style={styles.label}>Jornada</Text>
      <TextInput
        value={numeroFecha}
        onChangeText={setNumeroFecha}
        keyboardType="number-pad"
        maxLength={3}
        accessibilityLabel="Número de jornada"
        style={styles.input}
      />

      <Text style={styles.label}>Equipo local</Text>
      {cargandoEquipos ? <ActivityIndicator color={colors.primary} /> : null}
      <View style={styles.chips}>
        {equipos.map((equipo) => (
          <Chip
            key={equipo.id}
            activo={localId === equipo.id}
            disabled={visitanteId === equipo.id}
            texto={equipo.nombre}
            onPress={() => setLocalId(equipo.id)}
          />
        ))}
      </View>
      {!cargandoEquipos && equipos.length === 0 && torneoId !== null ? (
        <Text style={styles.hint}>Ese torneo no tiene equipos activos.</Text>
      ) : null}

      <Text style={styles.label}>Equipo visitante</Text>
      <View style={styles.chips}>
        {equipos.map((equipo) => (
          <Chip
            key={equipo.id}
            activo={visitanteId === equipo.id}
            disabled={localId === equipo.id}
            texto={equipo.nombre}
            onPress={() => setVisitanteId(equipo.id)}
          />
        ))}
      </View>

      <Text style={styles.label}>Cancha</Text>
      <View style={styles.chips}>
        {canchas.map((cancha) => (
          <Chip
            key={cancha.id}
            activo={canchaId === cancha.id}
            texto={cancha.nombre}
            onPress={() => setCanchaId(cancha.id)}
          />
        ))}
      </View>

      <Text style={styles.label}>Árbitro</Text>
      <View style={styles.chips}>
        {arbitros.map((arbitro) => (
          <Chip
            key={arbitro.id}
            activo={arbitroId === arbitro.id}
            texto={`${arbitro.apellido}, ${arbitro.nombre}`}
            onPress={() => setArbitroId(arbitro.id)}
          />
        ))}
      </View>

      <View style={styles.fila}>
        <View style={styles.columna}>
          <Text style={styles.label}>Fecha (AAAA-MM-DD)</Text>
          <TextInput
            value={fecha}
            onChangeText={setFecha}
            maxLength={10}
            placeholder="2026-11-07"
            accessibilityLabel="Fecha del partido"
            style={styles.input}
          />
        </View>
        <View style={styles.columna}>
          <Text style={styles.label}>Hora (HH:mm)</Text>
          <TextInput
            value={hora}
            onChangeText={setHora}
            maxLength={5}
            placeholder="18:00"
            accessibilityLabel="Hora del partido"
            style={styles.input}
          />
        </View>
      </View>
      <Text style={styles.hint}>
        Se envía con el horario de Santa Fe (-03:00). {nombreTorneo ? `Torneo: ${nombreTorneo}.` : ''}
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <ActionButton
        title={sending ? 'Guardando…' : mode === 'create' ? 'Programar partido' : 'Guardar cambios'}
        onPress={() => { void submit(); }}
        disabled={sending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.sm },
  label: { ...typography.label, color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActivo: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  chipDeshabilitado: { opacity: 0.4 },
  chipTexto: { ...typography.label, color: colors.text },
  chipTextoActivo: { color: colors.primaryDark },
  fila: { flexDirection: 'row', gap: spacing.sm },
  columna: { flex: 1, gap: spacing.sm },
  hint: { ...typography.caption, color: colors.textMuted },
  error: { ...typography.body, color: colors.danger },
});
