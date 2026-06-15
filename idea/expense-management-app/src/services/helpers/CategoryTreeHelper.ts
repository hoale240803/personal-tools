const UNCLASSIFIED_CATEGORY = "Unclassified";
const CATEGORY_SEPARATOR = " > ";

/**
 * Two-level category tree used by the LLM categoriser.
 * Format: { parent: string, children: string[] }
 */
export interface CategoryTreeEntry {
  parent: string;
  children: string[];
}

/**
 * Default Vietnamese two-level category tree matching the sample UI spec.
 */
const DEFAULT_CATEGORY_TREE: CategoryTreeEntry[] = [
  { parent: "Chăm sóc cá nhân", children: ["Làm móng", "Cắt tóc", "Spa", "Mỹ phẩm"] },
  { parent: "Ăn uống", children: ["Ăn sáng", "Ăn trưa", "Ăn tối", "Cà phê", "Ăn vặt"] },
  { parent: "Tự thưởng bản thân", children: ["Mua sách", "Đi phượt", "Đi bar", "Giải trí"] },
  { parent: "Di chuyển", children: ["Grab", "Gửi xe", "Xăng", "Vé xe"] },
  { parent: "Mua sắm", children: ["Quần áo", "Điện tử", "Gia dụng", "Online"] },
  { parent: "Hóa đơn & Tiện ích", children: ["Điện", "Nước", "Internet", "Điện thoại"] },
];

/**
 * Returns the default two-level category tree for AI categorisation.
 *
 * @returns Array of parent categories with their child sub-categories.
 */
export function getDefaultCategoryTree(): CategoryTreeEntry[] {
  return DEFAULT_CATEGORY_TREE;
}

/**
 * Flattens the category tree into "Parent > Child" label strings for the LLM prompt.
 *
 * @param tree - Category tree entries.
 * @returns Array of hierarchical category labels.
 */
export function flattenCategoryTree(tree: CategoryTreeEntry[]): string[] {
  const labels: string[] = [];

  for (const entry of tree) {
    for (const child of entry.children) {
      labels.push(`${entry.parent}${CATEGORY_SEPARATOR}${child}`);
    }
  }

  return labels;
}

/**
 * Validates and normalises a category string returned by the LLM.
 * Returns UNCLASSIFIED_CATEGORY when the value is missing or not in the allowed list.
 *
 * @param rawCategory - Category string from the LLM response.
 * @param allowedLabels - Flat list of valid "Parent > Child" labels.
 * @returns A validated category label.
 */
export function normalizeCategoryLabel(
  rawCategory: string | undefined | null,
  allowedLabels: string[]
): string {
  if (!rawCategory || rawCategory.trim() === "") {
    return UNCLASSIFIED_CATEGORY;
  }

  const trimmed = rawCategory.trim();
  if (trimmed.toLowerCase() === UNCLASSIFIED_CATEGORY.toLowerCase()) {
    return UNCLASSIFIED_CATEGORY;
  }

  const exactMatch = allowedLabels.find(
    (label) => label.toLowerCase() === trimmed.toLowerCase()
  );
  return exactMatch ?? UNCLASSIFIED_CATEGORY;
}

/**
 * Builds the category section of the LLM system prompt.
 *
 * @param tree - Category tree entries.
 * @returns Formatted multi-line string listing all valid categories.
 */
export function buildCategoryPromptSection(tree: CategoryTreeEntry[]): string {
  const labels = flattenCategoryTree(tree);
  const labelList = labels.map((label) => `- ${label}`).join("\n");
  return `Valid categories (choose exactly one, or "${UNCLASSIFIED_CATEGORY}" if uncertain):\n${labelList}`;
}
