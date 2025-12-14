import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export interface AgendaItem {
  title: string
  description?: string
  duration: number
}

interface AgendaEditorProps {
  items: AgendaItem[]
  onChange: (items: AgendaItem[]) => void
  readOnly?: boolean
}

export default function AgendaEditor({ items, onChange, readOnly = false }: AgendaEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const handleAddItem = () => {
    onChange([...items, { title: '', description: '', duration: 15 }])
    setEditingIndex(items.length)
  }

  const handleRemoveItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const handleUpdateItem = (index: number, field: keyof AgendaItem, value: any) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    onChange(updated)
  }

  if (readOnly) {
    return (
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No agenda items</p>
        ) : (
          items.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-foreground">{item.title}</h4>
                  <span className="text-xs text-muted-foreground">{item.duration} min</span>
                </div>
                {item.description && (
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Label>Agenda Items</Label>
      <div className="space-y-3">
        {items.map((item, index) => (
          <Card key={index} className={editingIndex === index ? 'border-primary' : ''}>
            <CardContent className="p-4">
              {editingIndex === index ? (
                <div className="space-y-3">
                  <Input
                    placeholder="Agenda item title"
                    value={item.title}
                    onChange={(e) => handleUpdateItem(index, 'title', e.target.value)}
                  />
                  <Textarea
                    placeholder="Description (optional)"
                    value={item.description || ''}
                    onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Duration (minutes)"
                      value={item.duration}
                      onChange={(e) => handleUpdateItem(index, 'duration', parseInt(e.target.value) || 0)}
                      className="w-32"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingIndex(null)}
                      className="flex-1"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1 cursor-pointer" onClick={() => setEditingIndex(index)}>
                    <h4 className="font-semibold text-foreground">{item.title || '(Untitled)'}</h4>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">{item.duration} minutes</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddItem}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Agenda Item
      </Button>
    </div>
  )
}
