import { FC, useState, createContext, useContext } from "react";
import { ID, WithChildren } from "../../../../../../_metronic/helpers";

export interface ListViewContextProps {
  selected: Array<ID>;
  onSelect: (selectedId: ID) => void;
  onSelectAll: () => void;
  clearSelected: () => void;
  isAllSelected: boolean;
  disabled: boolean;
  itemIdForUpdate?: ID;
  setItemIdForUpdate: (id: ID | undefined) => void;
}

const initialListView: ListViewContextProps = {
  selected: [],
  onSelect: () => {},
  onSelectAll: () => {},
  clearSelected: () => {},
  isAllSelected: false,
  disabled: false,
  itemIdForUpdate: undefined,
  setItemIdForUpdate: () => {},
};

const ListViewContext = createContext<ListViewContextProps>(initialListView);

const useListView = () => useContext(ListViewContext);

const ListViewProvider: FC<WithChildren> = ({ children }) => {
  const [selected, setSelected] = useState<Array<ID>>(initialListView.selected);
  const [itemIdForUpdate, setItemIdForUpdate] = useState<ID | undefined>(
    initialListView.itemIdForUpdate
  );
  const disabled = selected.length === 0;

  const onSelect = (selectedId: ID) => {
    if (!selectedId) {
      return;
    }

    if (selected.includes(selectedId)) {
      setSelected(selected.filter((id) => id !== selectedId));
    } else {
      const newSelected = [...selected];
      newSelected.push(selectedId);
      setSelected(newSelected);
    }
  };

  const onSelectAll = () => {
    setSelected([]);
  };

  const clearSelected = () => {
    setSelected([]);
  };

  const isAllSelected = false;

  return (
    <ListViewContext.Provider
      value={{
        selected,
        onSelect,
        onSelectAll,
        clearSelected,
        isAllSelected,
        disabled,
        itemIdForUpdate,
        setItemIdForUpdate,
      }}
    >
      {children}
    </ListViewContext.Provider>
  );
};

export { ListViewProvider, useListView };
