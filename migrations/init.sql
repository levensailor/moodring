-- Create enum type for board item types
CREATE TYPE board_item_type AS ENUM (
  'photo',
  'text',
  'link',
  'icon',
  'shape',
  'line',
  'arrow',
  'subboard'
);

-- Create boards table
CREATE TABLE IF NOT EXISTS boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  background_color TEXT NOT NULL DEFAULT '#ffffff',
  background_transparency REAL NOT NULL DEFAULT 1.0,
  background_wallpaper TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create board_items table
CREATE TABLE IF NOT EXISTS board_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  type board_item_type NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  position_x REAL NOT NULL,
  position_y REAL NOT NULL,
  width REAL NOT NULL,
  height REAL NOT NULL,
  rotation REAL NOT NULL DEFAULT 0,
  z_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_board_items_board_id ON board_items(board_id);
CREATE INDEX IF NOT EXISTS idx_boards_position ON boards(position);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON boards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_board_items_updated_at BEFORE UPDATE ON board_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

