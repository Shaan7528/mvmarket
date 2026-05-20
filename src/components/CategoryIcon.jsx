import {
  Shirt,
  Smartphone,
  UtensilsCrossed,
  Sparkles,
  Home,
  Dumbbell,
  BookOpen,
  Palette,
  Package,
} from 'lucide-react'

const ICON_MAP = {
  shirt: Shirt,
  smartphone: Smartphone,
  utensils: UtensilsCrossed,
  sparkles: Sparkles,
  home: Home,
  dumbbell: Dumbbell,
  book: BookOpen,
  palette: Palette,
  package: Package,
}

export function CategoryIcon({ name, className = 'w-6 h-6 text-neutral-700' }) {
  const Icon = ICON_MAP[name] || Package
  return <Icon className={className} strokeWidth={1.75} aria-hidden />
}
