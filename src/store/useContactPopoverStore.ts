import { create } from "zustand";

type State = {
  open: boolean;
  setOpen: (open: boolean) => void;
  contact: any;
  contactId: any;
  setContactId: (contactId: any) => void;
  setContact: (contact: any) => void;
};

const useContactPopoverStore = create<State>((set) => ({
  open: false,
  setOpen: (open: boolean) => set({ open }),
  contact: null,
  contactId: null,
  setContactId: (contactId: any) => set({ contactId }),
  setContact: (contact: any) => set({ contact }),
}));

export default useContactPopoverStore;