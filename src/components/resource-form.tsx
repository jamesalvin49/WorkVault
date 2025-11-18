'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
}

interface Resource {
  id: string;
  name: string;
  url: string;
  type: 'URL' | 'FOLDER';
  description?: string;
  icon?: string;
  tags?: string[];
  categoryId?: string;
  isFavorite: boolean;
  accessCount: number;
  lastAccessed?: string;
  createdAt: string;
  updatedAt: string;
}

interface ResourceFormProps {
  resource?: Resource | null;
  categories: Category[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function ResourceForm({ resource, categories, onSubmit, onCancel }: ResourceFormProps) {
  const [formData, setFormData] = useState({
    name: resource?.name || '',
    url: resource?.url || '',
    type: resource?.type || 'URL',
    description: resource?.description || '',
    icon: resource?.icon || '',
    tags: resource?.tags || [],
    categoryId: resource?.categoryId || null,
    isFavorite: resource?.isFavorite || false
  });

  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<{name?: string; url?: string}>({});

  // Auto-detect type based on URL
  useEffect(() => {
    if (formData.url && !resource) {
      const isUrl = formData.url.startsWith('http://') || formData.url.startsWith('https://') || formData.url.includes('.');
      setFormData(prev => ({
        ...prev,
        type: isUrl ? 'URL' : 'FOLDER'
      }));
    }
  }, [formData.url, resource]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors: {name?: string; url?: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.url.trim()) {
      newErrors.url = 'URL or path is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    onSubmit(formData);
  };

  const handleNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, name: value }));
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: undefined }));
    }
  };

  const handleUrlChange = (value: string) => {
    setFormData(prev => ({ ...prev, url: value }));
    if (errors.url) {
      setErrors(prev => ({ ...prev, url: undefined }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    console.log('Removing tag:', tagToRemove);
    console.log('Current tags before removal:', formData.tags);
    setFormData(prev => {
      const newTags = prev.tags.filter(tag => tag !== tagToRemove);
      console.log('New tags after removal:', newTags);
      return {
        ...prev,
        tags: newTags
      };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Resource name"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'URL' | 'FOLDER' }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="URL">URL</SelectItem>
              <SelectItem value="FOLDER">Folder Path</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">URL / Folder Path *</Label>
        <Input
          id="url"
          value={formData.url}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder={formData.type === 'URL' ? 'https://example.com' : '/path/to/folder'}
          className={errors.url ? 'border-red-500' : ''}
        />
        {errors.url && <p className="text-sm text-red-500">{errors.url}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Optional description or notes"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.categoryId || 'none'}
            onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value === 'none' ? null : value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No category</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="icon">Icon URL</Label>
          <Input
            id="icon"
            value={formData.icon}
            onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
            placeholder="https://example.com/icon.png"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <Button type="button" onClick={addTag} variant="outline">
            Add
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map((tag, index) => (
              <div 
                key={index} 
                className="flex items-center gap-1 relative group cursor-pointer"
                onClick={() => {
                  console.log('Badge clicked for tag:', tag);
                  removeTag(tag);
                }}
              >
                <Badge variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 hover:bg-red-200 rounded-full p-0.5 z-10"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('X button clicked for tag:', tag);
                      removeTag(tag);
                    }}
                  />
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="favorite"
          checked={formData.isFavorite}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFavorite: checked as boolean }))}
        />
        <Label htmlFor="favorite">Mark as favorite</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {resource ? 'Update Resource' : 'Create Resource'}
        </Button>
      </div>
    </form>
  );
}