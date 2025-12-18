export type BoardItemType =
  | "photo"
  | "text"
  | "link"
  | "icon"
  | "shape"
  | "line"
  | "arrow"
  | "subboard";

export interface Board {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  position: number;
  background_color: string;
  background_transparency: number;
  background_wallpaper: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface BoardItem {
  id: string;
  board_id: string;
  type: BoardItemType;
  content: Record<string, any>;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  rotation: number;
  z_index: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBoardInput {
  title: string;
  description?: string;
  icon?: string;
}

export interface UpdateBoardInput {
  title?: string;
  description?: string;
  icon?: string;
  background_color?: string;
  background_transparency?: number;
  background_wallpaper?: string | null;
}

export interface CreateBoardItemInput {
  board_id: string;
  type: BoardItemType;
  content: Record<string, any>;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  rotation?: number;
  z_index?: number;
}

export interface UpdateBoardItemInput {
  position_x?: number;
  position_y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  z_index?: number;
  content?: Record<string, any>;
}

export interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

