import { useUserLocalStorage } from './useUserLocalStorage';
import { ConnectedInstitution, LinkedAccount, ConnectionStatus } from '@/types/bankConnections';
import { v4 as uuidv4 } from 'uuid';

export function useBankConnections() {
  const [institutions, setInstitutions] = useUserLocalStorage<ConnectedInstitution[]>('connected_institutions', []);
  const [linkedAccounts, setLinkedAccounts] = useUserLocalStorage<LinkedAccount[]>('linked_accounts', []);

  const connectInstitution = (
    institutionName: string,
    logo: string,
    primaryColor: string,
    accounts: Omit<LinkedAccount, 'id' | 'institutionId' | 'lastUpdated'>[]
  ) => {
    const newInstitution: ConnectedInstitution = {
      id: uuidv4(),
      name: institutionName,
      logo,
      primaryColor,
      connectionStatus: 'connected',
      lastSync: new Date().toISOString(),
      itemId: `item_${uuidv4()}`,
      createdAt: new Date().toISOString(),
    };

    const newAccounts: LinkedAccount[] = accounts.map(account => ({
      ...account,
      id: uuidv4(),
      institutionId: newInstitution.id,
      lastUpdated: new Date().toISOString(),
    }));

    setInstitutions([...institutions, newInstitution]);
    setLinkedAccounts([...linkedAccounts, ...newAccounts]);

    return { institution: newInstitution, accounts: newAccounts };
  };

  const disconnectInstitution = (institutionId: string) => {
    setInstitutions(institutions.filter(inst => inst.id !== institutionId));
    setLinkedAccounts(linkedAccounts.filter(acc => acc.institutionId !== institutionId));
  };

  const refreshConnection = (institutionId: string) => {
    const updatedInstitutions = institutions.map(inst =>
      inst.id === institutionId
        ? { ...inst, connectionStatus: 'syncing' as ConnectionStatus, lastSync: new Date().toISOString() }
        : inst
    );
    setInstitutions(updatedInstitutions);

    // Simulate sync completing after 2 seconds
    setTimeout(() => {
      const syncedInstitutions = updatedInstitutions.map(inst =>
        inst.id === institutionId
          ? { ...inst, connectionStatus: 'connected' as ConnectionStatus }
          : inst
      );
      setInstitutions(syncedInstitutions);
    }, 2000);
  };

  const getInstitutionAccounts = (institutionId: string): LinkedAccount[] => {
    return linkedAccounts.filter(acc => acc.institutionId === institutionId);
  };

  const getConnectionStatus = () => {
    const totalAccounts = linkedAccounts.length;
    const connectedInstitutions = institutions.filter(i => i.connectionStatus === 'connected').length;
    const needsAttention = institutions.filter(i => i.connectionStatus === 'needs_attention').length;
    
    const lastSync = institutions.length > 0
      ? institutions.reduce((latest, inst) => {
          if (!inst.lastSync) return latest;
          if (!latest) return inst.lastSync;
          return new Date(inst.lastSync) > new Date(latest) ? inst.lastSync : latest;
        }, null as string | null)
      : null;

    return {
      totalAccounts,
      connectedInstitutions,
      needsAttention,
      lastSync,
      allHealthy: needsAttention === 0 && institutions.length > 0,
    };
  };

  return {
    institutions,
    linkedAccounts,
    connectInstitution,
    disconnectInstitution,
    refreshConnection,
    getInstitutionAccounts,
    getConnectionStatus,
  };
}
