"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface Contact {
  id: string;
  fullName: string;
  mobileNumber?: string;
  officeExtension?: string;
  email?: string;
  department?: string;
  notes?: string;
  profilePicture?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface ContactFormProps {
  contact?: Contact | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function ContactForm({ contact, onSubmit, onCancel }: ContactFormProps) {
  const [formData, setFormData] = useState({
    fullName: contact?.fullName || "",
    mobileNumber: contact?.mobileNumber || "",
    officeExtension: contact?.officeExtension || "",
    email: contact?.email || "",
    department: contact?.department || "",
    notes: contact?.notes || "",
    profilePicture: contact?.profilePicture || "",
    tags: contact?.tags || [],
  });

  const [newTag, setNewTag] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out empty values and convert "none" to null
    const cleanedData = {
      ...formData,
      department: formData.department === "none" ? null : formData.department,
      mobileNumber: formData.mobileNumber.trim() || null,
      officeExtension: formData.officeExtension.trim() || null,
      email: formData.email.trim() || null,
      notes: formData.notes.trim() || null,
      profilePicture: formData.profilePicture.trim() || null,
      tags: formData.tags.filter((tag) => tag.trim()),
    };

    onSubmit(cleanedData);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    console.log("Removing tag:", tagToRemove);
    console.log("Current tags before removal:", formData.tags);
    setFormData((prev) => {
      const newTags = prev.tags.filter((tag) => tag !== tagToRemove);
      console.log("New tags after removal:", newTags);
      return {
        ...prev,
        tags: newTags,
      };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name *</Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, fullName: e.target.value }))
          }
          placeholder="John Doe"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="john.doe@company.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobileNumber">Mobile Number</Label>
          <Input
            id="mobileNumber"
            value={formData.mobileNumber}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, mobileNumber: e.target.value }))
            }
            placeholder="+1 234 567 8900"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="officeExtension">Office Extension</Label>
          <Input
            id="officeExtension"
            value={formData.officeExtension}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                officeExtension: e.target.value,
              }))
            }
            placeholder="1234"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select
            value={formData.department}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, department: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No department</SelectItem>
              <SelectItem value="IT">IT</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
              <SelectItem value="Operations">Operations</SelectItem>
              <SelectItem value="Customs">Customs</SelectItem>
              <SelectItem value="Others">Others</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profilePicture">Profile Picture URL</Label>
        <Input
          id="profilePicture"
          value={formData.profilePicture}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, profilePicture: e.target.value }))
          }
          placeholder="https://example.com/avatar.jpg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          placeholder="Additional notes about the contact"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag"
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), addTag())
            }
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
                  console.log("Badge clicked for tag:", tag);
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
                      console.log("X button clicked for tag:", tag);
                      removeTag(tag);
                    }}
                  />
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {contact ? "Update Contact" : "Create Contact"}
        </Button>
      </div>
    </form>
  );
}
