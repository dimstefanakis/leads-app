import { create } from 'zustand'
import type { Database } from '../../types_db'

export type Workspace = Database['public']['Tables']['workspaces']['Row'];

type State = {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  setCurrentWorkspace: (workspace: Workspace) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  fetchWorkspaces: (callback?: (workspaces: Workspace[])=>void) => void;
  createAndSetWorkspace: () => void;
}

const useWorkspaceStore = create<State>((set) => ({
  currentWorkspace: null,
  workspaces: [],
  setCurrentWorkspace: (workspace: Workspace) => set({ currentWorkspace: workspace }),
  setWorkspaces: (workspaces: Workspace[]) => set({ workspaces }),
  fetchWorkspaces: async (
    callback?: (workspaces: Workspace[])=>void
  ) => {
    const response = await fetch('/api/get-my-workspaces')
    const data = await response.json()
    set({ workspaces: data })
    if(useWorkspaceStore.getState().currentWorkspace){
      const currentWorkspace = data.find((workspace: Workspace) => workspace.id === useWorkspaceStore.getState().currentWorkspace?.id)
      if(currentWorkspace){
        set({ currentWorkspace })
      }
    }
    if(callback){
      callback(data)
    }
  },
  createAndSetWorkspace: async () => {
    const response = await fetch('/api/create-workspace', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    if(data.length > 0){
      set({ currentWorkspace: data[0], workspaces: [data[0], ...useWorkspaceStore.getState().workspaces] })

    }
  }
}))

export default useWorkspaceStore
