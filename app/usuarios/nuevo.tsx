import { router } from 'expo-router';
import { AppScreen, SectionCard } from '@/components';
import { ActionButton } from '@/features/auth/components/ActionButton';
import { UsuarioForm } from '@/features/users/components/UsuarioForm';
import { usersApi } from '@/features/users/services/usersApi';

/** RF-02: alta administrativa; no hay registro público desde la app. */
export default function NuevoUsuarioScreen() {
  return (
    <AppScreen>
      <SectionCard title="Nuevo usuario" subtitle="ADMIN o DELEGADO">
        <UsuarioForm mode="create" onSave={async ({ username, password, nombreCompleto, rol }) => {
          const created = await usersApi.crear({ username, password, nombreCompleto, rol });
          router.replace(`/usuarios/${created.id}`);
        }} />
        <ActionButton title="Volver al listado" onPress={() => router.replace('/usuarios')} secondary />
      </SectionCard>
    </AppScreen>
  );
}
