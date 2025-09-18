export interface PaletteTemplate {
  id: string;
  name: string;
  description: string;
  category:
    | 'material'
    | 'flat'
    | 'gradient'
    | 'monochrome'
    | 'vibrant'
    | 'pastel';
  colors: string[];
  tags: string[];
}

export const paletteTemplates: PaletteTemplate[] = [
  // Material Design
  {
    id: 'material-blue',
    name: 'Material Blue',
    description: 'Классическая синяя палитра Material Design',
    category: 'material',
    colors: ['#2196F3', '#1976D2', '#0D47A1', '#BBDEFB', '#E3F2FD'],
    tags: ['material', 'blue', 'google', 'android'],
  },
  {
    id: 'material-green',
    name: 'Material Green',
    description: 'Зеленая палитра для успешных действий',
    category: 'material',
    colors: ['#4CAF50', '#388E3C', '#1B5E20', '#C8E6C9', '#E8F5E8'],
    tags: ['material', 'green', 'success', 'nature'],
  },
  {
    id: 'material-red',
    name: 'Material Red',
    description: 'Красная палитра для ошибок и предупреждений',
    category: 'material',
    colors: ['#F44336', '#D32F2F', '#B71C1C', '#FFCDD2', '#FFEBEE'],
    tags: ['material', 'red', 'error', 'warning'],
  },
  {
    id: 'material-orange',
    name: 'Material Orange',
    description: 'Оранжевая палитра для акцентов',
    category: 'material',
    colors: ['#FF9800', '#F57C00', '#E65100', '#FFE0B2', '#FFF3E0'],
    tags: ['material', 'orange', 'accent', 'warm'],
  },

  // Flat Design
  {
    id: 'flat-turquoise',
    name: 'Flat Turquoise',
    description: 'Современная бирюзовая палитра',
    category: 'flat',
    colors: ['#1ABC9C', '#16A085', '#2ECC71', '#27AE60', '#58D68D'],
    tags: ['flat', 'turquoise', 'modern', 'fresh'],
  },
  {
    id: 'flat-purple',
    name: 'Flat Purple',
    description: 'Элегантная фиолетовая палитра',
    category: 'flat',
    colors: ['#9B59B6', '#8E44AD', '#663399', '#BB8FCE', '#E8DAEF'],
    tags: ['flat', 'purple', 'elegant', 'creative'],
  },
  {
    id: 'flat-sunflower',
    name: 'Flat Sunflower',
    description: 'Яркая желтая палитра',
    category: 'flat',
    colors: ['#F1C40F', '#F39C12', '#E67E22', '#F7DC6F', '#FCF3CF'],
    tags: ['flat', 'yellow', 'bright', 'energy'],
  },

  // Gradient Palettes
  {
    id: 'sunset-gradient',
    name: 'Sunset Gradient',
    description: 'Теплый градиент заката',
    category: 'gradient',
    colors: ['#FF6B6B', '#FF8E53', '#FF6B9D', '#C44569', '#F8B500'],
    tags: ['gradient', 'sunset', 'warm', 'romantic'],
  },
  {
    id: 'ocean-gradient',
    name: 'Ocean Gradient',
    description: 'Прохладный океанский градиент',
    category: 'gradient',
    colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'],
    tags: ['gradient', 'ocean', 'cool', 'calm'],
  },
  {
    id: 'forest-gradient',
    name: 'Forest Gradient',
    description: 'Природный лесной градиент',
    category: 'gradient',
    colors: ['#134E5E', '#71B280', '#A8E6CF', '#88D8A3', '#2D5016'],
    tags: ['gradient', 'forest', 'nature', 'organic'],
  },

  // Monochrome
  {
    id: 'grayscale',
    name: 'Grayscale',
    description: 'Классическая серая палитра',
    category: 'monochrome',
    colors: ['#2C3E50', '#34495E', '#7F8C8D', '#BDC3C7', '#ECF0F1'],
    tags: ['monochrome', 'gray', 'neutral', 'professional'],
  },
  {
    id: 'sepia',
    name: 'Sepia',
    description: 'Винтажная сепия палитра',
    category: 'monochrome',
    colors: ['#8B4513', '#A0522D', '#CD853F', '#DEB887', '#F5DEB3'],
    tags: ['monochrome', 'sepia', 'vintage', 'warm'],
  },

  // Vibrant
  {
    id: 'neon-vibes',
    name: 'Neon Vibes',
    description: 'Яркая неоновая палитра',
    category: 'vibrant',
    colors: ['#FF0080', '#00FF80', '#8000FF', '#FF8000', '#0080FF'],
    tags: ['vibrant', 'neon', 'bright', 'cyberpunk'],
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    description: 'Классическая радужная палитра',
    category: 'vibrant',
    colors: ['#FF0000', '#FF8000', '#FFFF00', '#00FF00', '#0080FF'],
    tags: ['vibrant', 'rainbow', 'colorful', 'fun'],
  },

  // Pastel
  {
    id: 'soft-pastels',
    name: 'Soft Pastels',
    description: 'Мягкие пастельные тона',
    category: 'pastel',
    colors: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF'],
    tags: ['pastel', 'soft', 'gentle', 'calm'],
  },
  {
    id: 'lavender-dreams',
    name: 'Lavender Dreams',
    description: 'Нежные лавандовые оттенки',
    category: 'pastel',
    colors: ['#E6E6FA', '#D8BFD8', '#DDA0DD', '#DA70D6', '#BA55D3'],
    tags: ['pastel', 'lavender', 'dreamy', 'feminine'],
  },

  // Professional
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    description: 'Профессиональная синяя палитра',
    category: 'material',
    colors: ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'],
    tags: ['corporate', 'blue', 'professional', 'business'],
  },
  {
    id: 'tech-dark',
    name: 'Tech Dark',
    description: 'Темная технологическая палитра',
    category: 'monochrome',
    colors: ['#0F172A', '#1E293B', '#334155', '#64748B', '#94A3B8'],
    tags: ['tech', 'dark', 'modern', 'developer'],
  },

  // Nature
  {
    id: 'earth-tones',
    name: 'Earth Tones',
    description: 'Природные земляные тона',
    category: 'material',
    colors: ['#8B4513', '#A0522D', '#D2691E', '#CD853F', '#DEB887'],
    tags: ['earth', 'nature', 'organic', 'warm'],
  },
  {
    id: 'forest-greens',
    name: 'Forest Greens',
    description: 'Лесные зеленые оттенки',
    category: 'material',
    colors: ['#2D5016', '#3E7B3E', '#4A7C59', '#6B8E6B', '#8FBC8F'],
    tags: ['forest', 'green', 'nature', 'fresh'],
  },
];

export const getTemplatesByCategory = (
  category: PaletteTemplate['category']
): PaletteTemplate[] => {
  return paletteTemplates.filter((template) => template.category === category);
};

export const getTemplateById = (id: string): PaletteTemplate | undefined => {
  return paletteTemplates.find((template) => template.id === id);
};

export const searchTemplates = (query: string): PaletteTemplate[] => {
  const lowercaseQuery = query.toLowerCase();
  return paletteTemplates.filter(
    (template) =>
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.description.toLowerCase().includes(lowercaseQuery) ||
      template.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
  );
};
