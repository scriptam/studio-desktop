import { ConnectionEditorTemplate } from "@/database/editor";
import {
  CloudflareIcon,
  DoltIcon,
  MySQLIcon,
  PostgreIcon,
  SQLiteIcon,
  StarbaseIcon,
  TursoIcon,
} from "./outerbase-icon";

export interface ConnectionStoreItemConfig {
  ssl?: boolean;
  host: string;
  port?: string;
  database?: string;
  username?: string;
  password?: string;
}
export interface ConnectionStoreItem {
  id: string;
  name: string;
  type: string;
  color?: string;
  createdAt?: number;
  updatedAt?: number;
  lastConnectedAt?: number;
  config: ConnectionStoreItemConfig;
}

interface ConnectionTypeTemplate {
  name: string;
  label: string;
  template: ConnectionEditorTemplate;
  icon: React.ComponentType<{ className: string }>;
  defaultValue: ConnectionStoreItem["config"];
}

const genericTemplate: ConnectionEditorTemplate = [
  {
    columns: [
      { name: "host", label: "Host", type: "text", required: true },
      {
        name: "port",
        label: "Port",
        type: "text",
        required: true,
        size: "w-[100px]",
      },
    ],
  },
  {
    columns: [
      { name: "username", label: "Username", type: "text", required: true },
      {
        name: "password",
        label: "Password",
        type: "password",
        required: true,
      },
    ],
  },
  {
    columns: [
      { name: "database", label: "Database", type: "text", required: true },
    ],
  },
  {
    columns: [
      {
        name: "ssl",
        label: "SSL",
        type: "checkbox",
        required: false,
      },
    ],
  },
];

export const connectionTypeTemplates: Record<string, ConnectionTypeTemplate> = {
  mysql: {
    name: "mysql",
    label: "MySQL",
    template: genericTemplate,
    icon: MySQLIcon,
    defaultValue: {
      host: "localhost",
      port: "3306",
      username: "root",
    },
  },
  dolt: {
    name: "dolt",
    label: "Dolt",
    template: genericTemplate,
    icon: DoltIcon,
    defaultValue: {
      host: "localhost",
      port: "3306",
      username: "root",
    },
  },
  postgres: {
    name: "postgres",
    label: "PostgreSQL",
    template: genericTemplate,
    icon: PostgreIcon,
    defaultValue: {
      host: "localhost",
      port: "5432",
      username: "postgres",
      database: "postgres",
    },
  },
  turso: {
    name: "turso",
    label: "Turso",
    icon: TursoIcon,
    defaultValue: {
      host: "libsql://localhost",
      password: "",
    },
    template: [
      {
        columns: [{ name: "host", label: "URL", type: "text", required: true }],
      },
      {
        columns: [
          {
            name: "password",
            label: "Token",
            type: "textarea",
            placeholder: "Token",
            required: true,
          },
        ],
      },
    ],
  },
  cloudflare: {
    name: "cloudflare",
    label: "Cloudflare D1",
    icon: CloudflareIcon,
    defaultValue: {
      host: "",
      password: "",
    },
    template: [
      {
        columns: [
          {
            name: "database",
            label: "Database ID",
            type: "text",
            required: true,
          },
          {
            name: "username",
            label: "Account ID",
            type: "text",
            required: true,
          },
        ],
      },
      {
        columns: [
          { name: "password", label: "Token", type: "text", required: true },
        ],
      },
    ],
  },
  starbase: {
    name: "starbase",
    label: "Starbase",
    icon: StarbaseIcon,
    defaultValue: { host: "" },
    template: [
      {
        columns: [
          {
            name: "host",
            label: "URL",
            placeholder: "https://starbase.your-account.workers.dev",
            type: "text",
            required: true,
          },
        ],
      },
      {
        columns: [
          {
            name: "password",
            label: "Token",
            type: "textarea",
            placeholder: "Token",
            required: true,
          },
        ],
      },
    ],
  },
  sqlite: {
    name: "sqlite",
    label: "SQLite",
    icon: SQLiteIcon,
    defaultValue: { host: "" },
    template: [
      {
        columns: [
          {
            name: "host",
            label: "Database",
            type: "file",
            required: true,
            size: "max-w-[400px]",
            fileOption: {
              title: "Open File",
              filters: [
                {
                  name: "SQLite Database",
                  extensions: ["sqlite", "sqlite3", "db", "db3", "s3db"],
                },
                { name: "Any files", extensions: ["*"] },
              ],
            },
          },
        ],
      },
    ],
  },
};

export class ConnectionStoreManager {
  static list() {
    try {
      const data = localStorage.getItem("connections");
      if (!data) return [];
      const parsedJson = JSON.parse(data);
      // send to main process
      window.outerbaseIpc.send("connections", parsedJson);
      return parsedJson as ConnectionStoreItem[];
    } catch {
      return [];
    }
  }

  static get(connectionId: string) {
    const list = this.list();
    return list.find((i) => i.id === connectionId);
  }

  static remove(connectionId: string) {
    const list = this.list();

    const tmp = list.filter((i) => i.id !== connectionId);

    localStorage.setItem("connections", JSON.stringify(tmp));

    return tmp;
  }

  static duplicate(item: ConnectionStoreItem) {
    const newItem: ConnectionStoreItem = {
      ...item,
      id: crypto.randomUUID(),
      name: `${item.name} (Copy)`,
      createdAt: Date.now(),
    };

    // Make it below the original item
    const list = this.list();
    const index = list.findIndex((i) => i.id === item.id);
    list.splice(index + 1, 0, newItem);

    localStorage.setItem("connections", JSON.stringify(list));
    return list;
  }

  static save(item: ConnectionStoreItem) {
    const list = this.list();
    const index = list.findIndex((i) => i.id === item.id);

    if (index === -1) {
      list.unshift(item);
    } else {
      list[index] = item;
    }
    const finalData = this.sort(list);
    localStorage.setItem("connections", JSON.stringify(finalData));
  }

  static saveAll(items: ConnectionStoreItem[]) {
    localStorage.setItem("connections", JSON.stringify(items));
  }

  static sort(items: ConnectionStoreItem[]) {
    return items.sort((a, b) => {
      const aDate = a.lastConnectedAt || 0;
      const bDate = b.lastConnectedAt || 0;
      return bDate - aDate;
    });
  }
}
