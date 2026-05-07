import { 
  Sun, 
  Zap, 
  CheckCircle2, 
  Coffee, 
  Utensils, 
  Dumbbell, 
  Moon, 
  Bed,
  LucideProps
} from 'lucide-react'

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  Sun,
  Zap,
  CheckCircle2,
  Coffee,
  Utensils,
  Dumbbell,
  Moon,
  Bed
}

export default function IconRenderer({ name, className }: { name: string, className?: string }) {
  const Icon = ICON_MAP[name]
  if (!Icon) return null
  
  return <Icon className={className} strokeWidth={1.5} />
}
