import { useCallback, useMemo } from "react";

const MENU_SECTIONS = [
  { key: "starters", label: "Starters" },
  { key: "mains", label: "Mains" },
  { key: "desserts", label: "Desserts" },
  { key: "drinks", label: "Drinks" },
];

const getNormalizedItemName = (item) => {
  return (
    item?.name ??
    item?.title ??
    item?.itemName ??
    item?.dish ??
    item?.dishName ??
    ""
  );
};

export const useMenuSections = ({ menuData }) => {
  const getSectionItems = useCallback((sectionKey) => {
    const section = menuData?.[sectionKey];
    if (!Array.isArray(section)) {
      return [];
    }

    return section.filter((item) => {
      const name = getNormalizedItemName(item);
      return typeof name === "string" && name.trim().length > 0;
    });
  }, [menuData]);

  const hasAnyMenuItems = useMemo(() => {
    return MENU_SECTIONS.some((section) => getSectionItems(section.key).length > 0);
  }, [getSectionItems]);

  const allMenuItems = useMemo(() => {
    return MENU_SECTIONS.flatMap((section) =>
      getSectionItems(section.key).map((item) => ({
        section: section.key,
        name: getNormalizedItemName(item),
        description: item?.description ?? item?.descriptions ?? "",
        price: item?.price ?? "",
      })),
    );
  }, [getSectionItems]);

  return {
    menuSections: MENU_SECTIONS,
    getSectionItems,
    hasAnyMenuItems,
    allMenuItems,
  };
};

export default useMenuSections;
