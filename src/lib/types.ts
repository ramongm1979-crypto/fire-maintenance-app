export type AssetType = "extintor" | "bie" | "detector" | "central" | "compuerta";
export type EventType = "revision" | "incidencia" | "retimbrado" | "sustitucion";

export type Building = {
  id: string;
  name: string;
  address: string | null;
  notes: string | null;
  created_at: string;
};

export type Asset = {
  id: string;
  building_id: string;
  type: AssetType;
  code: string | null;
  location: string | null;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  install_date: string | null;
  expiry_date: string | null;
  last_check_date: string | null;
  next_due_date: string | null;
  status: string;
  attributes: Record<string, unknown>;
  created_at: string;
};

export type Manual = {
  id: string;
  title: string;
  brand: string | null;
  model: string | null;
  asset_type: AssetType | null;
  file_url: string;
  notes: string | null;
  created_at: string;
};

export type MaintenanceEvent = {
  id: string;
  asset_id: string;
  event_date: string;
  event_type: EventType;
  description: string | null;
  technician: string | null;
  attachments: string[];
  created_at: string;
};
