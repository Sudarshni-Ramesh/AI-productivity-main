export type SampleDatakey = "orders" | "schools" | "projects";

export type SampleDataMeta<T extends SampleDatakey> = {
  key: T;
  name: string;
  description: string;
};

export const SAMPLE_DATA: SampleDataMeta<SampleDatakey>[] = [
  {
    key: "orders",
    name: "Order Database",
    description:
      "Order System Database, with users, orders, product, and order_items table",
  },
  {
    key: "schools",
    name: "Schools Database",
    description: "School management database with teachers and students data",
  },
  {
    key: "projects",
    name: "Projects Database",
    description: "Project management database with users, events, and project details",
  },
];

export const getSampleDatabaseQuery = async (
  key: SampleDatakey
): Promise<string> => {
  switch (key) {
    case "orders":
      return await import("./orders-database.sql?raw").then(
        (res) => res.default
      );
    case "schools":
      return await import("./schools-database.sql?raw").then(
        (res) => res.default
      );
    case "projects":
      return await import("./projects-database.sql?raw").then(
        (res) => res.default
      );
  }

  throw new Error("failed to load data");
};
