"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  FolderOpen,
  Star,
  StarOff,
  Filter,
  Grid3X3,
  List,
  Phone,
  Mail,
  Building,
  User,
  MoreHorizontal,
  Moon,
  Sun,
  Keyboard,
  X,
} from "lucide-react";
import { ResourceForm } from "@/components/resource-form";
import { ContactForm } from "@/components/contact-form";
import { TagCloud } from "@/components/tag-cloud";

interface Resource {
  id: string;
  name: string;
  url: string;
  type: "URL" | "FOLDER";
  description?: string;
  icon?: string;
  tags?: string[];
  categoryId?: string;
  category?: {
    id: string;
    name: string;
  };
  isFavorite: boolean;
  accessCount: number;
  lastAccessed?: string;
  createdAt: string;
  updatedAt: string;
}

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

interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  _count?: {
    resources: number;
  };
}

export default function Home() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [showFavorites, setShowFavorites] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<string>("resources");
  const [darkMode, setDarkMode] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [deleteResourceDialogOpen, setDeleteResourceDialogOpen] =
    useState(false);
  const [deleteContactDialogOpen, setDeleteContactDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(
    null
  );
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);

  // Debounce search term
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
        setIsSearching(false);
      }, 700); // 700ms delay

      return () => clearTimeout(timer);
    }
  }, [searchTerm, debouncedSearchTerm]);

  // Fetch data with unified search
  const fetchResources = async () => {
    try {
      const params = new URLSearchParams();

      // Unified search parameter - searches ALL fields
      if (debouncedSearchTerm) {
        params.append("q", debouncedSearchTerm);
        console.log("Searching for:", debouncedSearchTerm);
      }

      if (selectedCategory !== "all")
        params.append("categoryId", selectedCategory);
      if (selectedType !== "all") params.append("type", selectedType);
      if (showFavorites) params.append("isFavorite", "true");

      console.log("Resource API call:", `/api/resources?${params.toString()}`);

      const response = await fetch(`/api/resources?${params}`);
      const data = await response.json();

      console.log("Resources received:", data.resources?.length || 0);
      setResources(data.resources || []);
    } catch (error) {
      console.error("Fetch resources error:", error);
      toast.error("Failed to fetch resources");
    }
  };

  const fetchContacts = async () => {
    try {
      const params = new URLSearchParams();

      // Unified search parameter - searches ALL fields
      if (debouncedSearchTerm) {
        params.append("q", debouncedSearchTerm);
        console.log("Searching contacts for:", debouncedSearchTerm);
      }

      if (selectedDepartment !== "all")
        params.append("department", selectedDepartment);

      console.log("Contact API call:", `/api/contacts?${params.toString()}`);

      const response = await fetch(`/api/contacts?${params}`);
      const data = await response.json();

      console.log("Contacts received:", data.contacts?.length || 0);
      setContacts(data.contacts || []);
    } catch (error) {
      console.error("Fetch contacts error:", error);
      toast.error("Failed to fetch contacts");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data || []);
    } catch (error) {
      toast.error("Failed to fetch categories");
    }
  };

  const fetchAllTags = async () => {
    try {
      const response = await fetch("/api/tags");
      const data = await response.json();
      setAllTags(data.tags || []);
    } catch (error) {
      toast.error("Failed to fetch tags");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (activeTab === "resources") {
        await Promise.all([
          fetchResources(),
          fetchCategories(),
          fetchAllTags(),
        ]);
      } else if (activeTab === "contacts") {
        await Promise.all([fetchContacts(), fetchCategories(), fetchAllTags()]);
      } else if (activeTab === "categories") {
        await Promise.all([fetchCategories(), fetchAllTags()]);
      }
      setLoading(false);
    };
    loadData();
  }, [
    debouncedSearchTerm,
    selectedCategory,
    selectedType,
    selectedDepartment,
    showFavorites,
    activeTab,
  ]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "k":
            e.preventDefault();
            document.getElementById("global-search")?.focus();
            break;
          case "n":
            e.preventDefault();
            setResourceDialogOpen(true);
            break;
          case "f":
            e.preventDefault();
            document.getElementById("filter-input")?.focus();
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Resource actions
  const handleDeleteResource = async (id: string) => {
    try {
      await fetch(`/api/resources/${id}`, { method: "DELETE" });
      toast.success("Resource deleted successfully");
      fetchResources();
      setDeleteResourceDialogOpen(false);
      setResourceToDelete(null);
    } catch (error) {
      toast.error("Failed to delete resource");
    }
  };

  const confirmDeleteResource = (resource: Resource) => {
    setResourceToDelete(resource);
    setDeleteResourceDialogOpen(true);
  };

  const handleToggleFavorite = async (resource: Resource) => {
    try {
      await fetch(`/api/resources/${resource.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...resource, isFavorite: !resource.isFavorite }),
      });
      toast.success("Resource updated successfully");
      fetchResources();
    } catch (error) {
      toast.error("Failed to update resource");
    }
  };

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const handleOpenResource = async (resource: Resource) => {
    try {
      if (resource.type === "URL") {
        window.open(resource.url, "_blank");
      } else {
        // For folders, we'll copy to clipboard since we can't open file explorer directly
        await handleCopyToClipboard(resource.url);
        toast.info("Folder path copied to clipboard");
      }
      // Update access count
      await fetch(`/api/resources/${resource.id}`, { method: "GET" });
      fetchResources();
    } catch (error) {
      toast.error("Failed to open resource");
    }
  };

  // Contact actions
  const handleDeleteContact = async (id: string) => {
    try {
      await fetch(`/api/contacts/${id}`, { method: "DELETE" });
      toast.success("Contact deleted successfully");
      fetchContacts();
      setDeleteContactDialogOpen(false);
      setContactToDelete(null);
    } catch (error) {
      toast.error("Failed to delete contact");
    }
  };

  const confirmDeleteContact = (contact: Contact) => {
    setContactToDelete(contact);
    setDeleteContactDialogOpen(true);
  };

  // Category actions
  const handleCreateCategory = async () => {
    try {
      if (!newCategoryName.trim()) {
        toast.error("Category name is required");
        return;
      }

      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create category");
      }

      toast.success("Category created successfully");
      setCategoryDialogOpen(false);
      setNewCategoryName("");
      setNewCategoryDescription("");
      fetchCategories();
    } catch (error) {
      toast.error(
        `Failed to create category: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      const savedDarkMode =
        localStorage.getItem("darkMode") === "true" ||
        (!localStorage.getItem("darkMode") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      setDarkMode(savedDarkMode);

      // Apply dark mode
      if (savedDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  // Apply dark mode changes when dark mode state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("darkMode", darkMode.toString());

      // Apply dark mode to document
      if (darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [darkMode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold">Resource Manager</h1>
                <Badge variant="secondary">Workplace Organizer</Badge>
              </div>

              <div className="flex items-center space-x-4">
                {/* Global Search - Now searches EVERYTHING */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="global-search"
                    type="text"
                    placeholder="Search across all fields... (Ctrl+K or Enter)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setDebouncedSearchTerm(searchTerm);
                      }
                    }}
                    className={`pl-10 pr-10 w-80 ${
                      isSearching ? "pr-10" : ""
                    } rounded-md`}
                  />
                  {searchTerm && !isSearching && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-md hover:bg-muted"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>

                {/* Dark Mode Toggle */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>

                {/* Keyboard Shortcuts */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowKeyboardShortcuts(true)}
                    >
                      <Keyboard className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Keyboard shortcuts</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-2 rounded-md">
              <TabsTrigger value="resources" className="rounded-md">
                Resources
              </TabsTrigger>
              <TabsTrigger value="contacts" className="rounded-md">
                Contacts
              </TabsTrigger>
            </TabsList>

            {/* Tag Cloud - Now acts as quick search filters */}
            {allTags.length > 0 && (
              <div className="mb-6 p-4 bg-card rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">
                  Quick Filters (Click to search)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.slice(0, 20).map((tag, index) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => setSearchTerm(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                  {allTags.length > 20 && (
                    <Badge variant="outline" className="cursor-pointer">
                      +{allTags.length - 20} more tags
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Tip: Clicking a tag searches across name, description,
                  tags, and more!
                </p>
              </div>
            )}

            {/* Resources Tab */}
            <TabsContent value="resources" className="space-y-6">
              {/* Resource Controls */}
              <div className="flex flex-wrap items-center gap-4">
                <Dialog
                  open={resourceDialogOpen}
                  onOpenChange={setResourceDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingResource(null)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Resource (Ctrl+N)
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingResource ? "Edit Resource" : "Add New Resource"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingResource
                          ? "Edit the resource details"
                          : "Add a new URL or folder path"}
                      </DialogDescription>
                    </DialogHeader>
                    <ResourceForm
                      resource={editingResource}
                      categories={categories}
                      onSubmit={async (data) => {
                        try {
                          const url = editingResource
                            ? `/api/resources/${editingResource.id}`
                            : "/api/resources";
                          const method = editingResource ? "PUT" : "POST";

                          const response = await fetch(url, {
                            method,
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(data),
                          });

                          if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(
                              errorData.error || `HTTP ${response.status}`
                            );
                          }

                          toast.success(
                            `Resource ${
                              editingResource ? "updated" : "created"
                            } successfully`
                          );
                          setResourceDialogOpen(false);
                          fetchResources();
                        } catch (error) {
                          console.error("Resource creation error:", error);
                          toast.error(
                            `Failed to ${
                              editingResource ? "update" : "create"
                            } resource: ${
                              error instanceof Error
                                ? error.message
                                : "Unknown error"
                            }`
                          );
                        }
                      }}
                      onCancel={() => setResourceDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>

                {/* Filters */}
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Dialog
                    open={categoryDialogOpen}
                    onOpenChange={setCategoryDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Category
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Category</DialogTitle>
                        <DialogDescription>
                          Add a new category to organize your resources
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="category-name">Category Name *</Label>
                          <Input
                            id="category-name"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Enter category name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category-description">
                            Description
                          </Label>
                          <Textarea
                            id="category-description"
                            value={newCategoryDescription}
                            onChange={(e) =>
                              setNewCategoryDescription(e.target.value)
                            }
                            placeholder="Optional description"
                            rows={3}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setCategoryDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleCreateCategory}>
                            Create Category
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="URL">URLs</SelectItem>
                      <SelectItem value="FOLDER">Folders</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="favorites"
                      checked={showFavorites}
                      onCheckedChange={(checked) =>
                        setShowFavorites(checked as boolean)
                      }
                    />
                    <Label htmlFor="favorites">Favorites only</Label>
                  </div>
                </div>

                {/* View Mode */}
                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Show results count */}
              {searchTerm && (
                <div className="text-sm text-muted-foreground">
                  Found {resources.length}{" "}
                  {resources.length === 1 ? "resource" : "resources"} matching "
                  {searchTerm}"
                </div>
              )}

              {/* Resources Grid/List */}
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {resources.map((resource, index) => {
                    const pastelColors = [
                      "bg-pink-50 border-pink-100",
                      "bg-purple-50 border-purple-100",
                      "bg-blue-50 border-blue-100",
                      "bg-green-50 border-green-100",
                      "bg-yellow-50 border-yellow-100",
                      "bg-orange-50 border-orange-100",
                      "bg-teal-50 border-teal-100",
                      "bg-indigo-50 border-indigo-100",
                    ];
                    const colorClass = darkMode
                      ? ""
                      : pastelColors[index % pastelColors.length];

                    return (
                      <Card
                        key={resource.id}
                        className={`hover:shadow-lg transition-all hover:scale-105 border ${colorClass} rounded-md`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8 bg-white shadow-sm rounded-md">
                                <AvatarImage src={resource.icon} />
                                <AvatarFallback className="bg-gradient-to-br from-violet-400 to-purple-500 text-white rounded-md">
                                  {resource.type === "URL" ? (
                                    <ExternalLink className="h-4 w-4" />
                                  ) : (
                                    <FolderOpen className="h-4 w-4" />
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-sm truncate">
                                  {resource.name}
                                </CardTitle>
                                <Badge variant="outline" className="text-xs">
                                  {resource.type}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleToggleFavorite(resource)}
                            >
                              {resource.isFavorite ? (
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ) : (
                                <StarOff className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {resource.description || "No description"}
                          </p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {resource.tags?.map((tag, index) => {
                              const tagColors = [
                                "bg-pink-100 text-pink-700 border-pink-200",
                                "bg-purple-100 text-purple-700 border-purple-200",
                                "bg-blue-100 text-blue-700 border-blue-200",
                                "bg-green-100 text-green-700 border-green-200",
                                "bg-yellow-100 text-yellow-700 border-yellow-200",
                                "bg-orange-100 text-orange-700 border-orange-200",
                              ];
                              const tagColorClass = darkMode
                                ? ""
                                : tagColors[index % tagColors.length];
                              return (
                                <Badge
                                  key={index}
                                  className={`text-xs border ${tagColorClass} rounded-md cursor-pointer`}
                                  onClick={() => setSearchTerm(tag)}
                                >
                                  {tag}
                                </Badge>
                              );
                            })}
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 font-medium dark:text-gray-400">
                              Accessed {resource.accessCount} times
                            </span>
                            {resource.category && (
                              <Badge className="text-xs bg-white/70 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 rounded-md">
                                {resource.category.name}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <Button
                              size="sm"
                              className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white border-0 shadow-sm rounded-md"
                              onClick={() => handleOpenResource(resource)}
                            >
                              {resource.type === "URL" ? "Open" : "Copy Path"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => confirmDeleteResource(resource)}
                              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 rounded-md"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleCopyToClipboard(resource.url)
                                  }
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy URL/Path
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingResource(resource);
                                    setResourceDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {resources.map((resource, index) => {
                    const pastelColors = [
                      "bg-pink-50 border-pink-100",
                      "bg-purple-50 border-purple-100",
                      "bg-blue-50 border-blue-100",
                      "bg-green-50 border-green-100",
                      "bg-yellow-50 border-yellow-100",
                      "bg-orange-50 border-orange-100",
                      "bg-teal-50 border-teal-100",
                      "bg-indigo-50 border-indigo-100",
                    ];
                    const colorClass = darkMode
                      ? ""
                      : pastelColors[index % pastelColors.length];

                    return (
                      <Card
                        key={resource.id}
                        className={`hover:shadow-md transition-all border ${colorClass} rounded-md`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10 bg-white shadow-sm rounded-md">
                                <AvatarImage src={resource.icon} />
                                <AvatarFallback className="bg-gradient-to-br from-violet-400 to-purple-500 text-white rounded-md">
                                  {resource.type === "URL" ? (
                                    <ExternalLink className="h-5 w-5" />
                                  ) : (
                                    <FolderOpen className="h-5 w-5" />
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium">{resource.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {resource.url}
                                </p>
                                {resource.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {resource.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleFavorite(resource)}
                              >
                                {resource.isFavorite ? (
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                ) : (
                                  <StarOff className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white border-0 shadow-sm rounded-md"
                                onClick={() => handleOpenResource(resource)}
                              >
                                {resource.type === "URL" ? "Open" : "Copy Path"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => confirmDeleteResource(resource)}
                                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 rounded-md"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleCopyToClipboard(resource.url)
                                    }
                                  >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy URL/Path
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setEditingResource(resource);
                                      setResourceDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Contacts Tab */}
            <TabsContent value="contacts" className="space-y-6">
              {/* Contact Controls */}
              <div className="flex flex-wrap items-center gap-4">
                <Dialog
                  open={contactDialogOpen}
                  onOpenChange={setContactDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingContact(null)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Contact
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingContact ? "Edit Contact" : "Add New Contact"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingContact
                          ? "Edit the contact details"
                          : "Add a new colleague contact"}
                      </DialogDescription>
                    </DialogHeader>
                    <ContactForm
                      contact={editingContact}
                      onSubmit={async (data) => {
                        try {
                          const url = editingContact
                            ? `/api/contacts/${editingContact.id}`
                            : "/api/contacts";
                          const method = editingContact ? "PUT" : "POST";

                          const response = await fetch(url, {
                            method,
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(data),
                          });

                          if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(
                              errorData.error || `HTTP ${response.status}`
                            );
                          }

                          toast.success(
                            `Contact ${
                              editingContact ? "updated" : "created"
                            } successfully`
                          );
                          setContactDialogOpen(false);
                          fetchContacts();
                        } catch (error) {
                          console.error("Contact creation error:", error);
                          toast.error(
                            `Failed to ${
                              editingContact ? "update" : "create"
                            } contact: ${
                              error instanceof Error
                                ? error.message
                                : "Unknown error"
                            }`
                          );
                        }
                      }}
                      onCancel={() => setContactDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>

                {/* Department Filter */}
                <Select
                  value={selectedDepartment}
                  onValueChange={setSelectedDepartment}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Show results count */}
              {searchTerm && (
                <div className="text-sm text-muted-foreground">
                  Found {contacts.length}{" "}
                  {contacts.length === 1 ? "contact" : "contacts"} matching "
                  {searchTerm}"
                </div>
              )}

              {/* Contacts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {contacts.map((contact, index) => {
                  const pastelColors = [
                    "bg-pink-50 border-pink-100",
                    "bg-purple-50 border-purple-100",
                    "bg-blue-50 border-blue-100",
                    "bg-green-50 border-green-100",
                    "bg-yellow-50 border-yellow-100",
                    "bg-orange-50 border-orange-100",
                    "bg-teal-50 border-teal-100",
                    "bg-indigo-50 border-indigo-100",
                  ];
                  const colorClass = darkMode
                    ? ""
                    : pastelColors[index % pastelColors.length];

                  return (
                    <Card
                      key={contact.id}
                      className={`hover:shadow-lg transition-all hover:scale-105 border ${colorClass} rounded-md`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12 bg-white shadow-sm rounded-md">
                            <AvatarImage src={contact.profilePicture} />
                            <AvatarFallback className="bg-gradient-to-br from-violet-400 to-purple-500 text-white font-semibold rounded-md">
                              {contact.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm truncate">
                              {contact.fullName}
                            </CardTitle>
                            {contact.department && (
                              <Badge className="text-xs bg-white/70 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 rounded-md">
                                {contact.department}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2 text-sm">
                          {contact.email && (
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <a
                                href={`mailto:${contact.email}`}
                                className="text-blue-600 hover:underline truncate"
                              >
                                {contact.email}
                              </a>
                            </div>
                          )}
                          {contact.mobileNumber && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <a
                                href={`tel:${contact.mobileNumber}`}
                                className="text-blue-600 hover:underline"
                              >
                                {contact.mobileNumber}
                              </a>
                            </div>
                          )}
                          {contact.officeExtension && (
                            <div className="flex items-center space-x-2">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span>Ext: {contact.officeExtension}</span>
                            </div>
                          )}
                        </div>

                        {contact.tags && contact.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {contact.tags.map((tag, index) => {
                              const tagColors = [
                                "bg-pink-100 text-pink-700 border-pink-200",
                                "bg-purple-100 text-purple-700 border-purple-200",
                                "bg-blue-100 text-blue-700 border-blue-200",
                                "bg-green-100 text-green-700 border-green-200",
                                "bg-yellow-100 text-yellow-700 border-yellow-200",
                                "bg-orange-100 text-orange-700 border-orange-200",
                              ];
                              const tagColorClass = darkMode
                                ? ""
                                : tagColors[index % tagColors.length];
                              return (
                                <Badge
                                  key={index}
                                  className={`text-xs border ${tagColorClass} rounded-md cursor-pointer`}
                                  onClick={() => setSearchTerm(tag)}
                                >
                                  {tag}
                                </Badge>
                              );
                            })}
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white border-0 shadow-sm rounded-md"
                            onClick={() => {
                              setEditingContact(contact);
                              setContactDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => confirmDeleteContact(contact)}
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 rounded-md"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </main>

        {/* Keyboard Shortcuts Dialog */}
        <Dialog
          open={showKeyboardShortcuts}
          onOpenChange={setShowKeyboardShortcuts}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Keyboard Shortcuts</DialogTitle>
              <DialogDescription>
                Quick keyboard shortcuts to navigate the application
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Global Search</span>
                <Badge variant="secondary">Ctrl+K</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>New Resource</span>
                <Badge variant="secondary">Ctrl+N</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Filter</span>
                <Badge variant="secondary">Ctrl+F</Badge>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Resource Confirmation Dialog */}
        <Dialog
          open={deleteResourceDialogOpen}
          onOpenChange={setDeleteResourceDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Resource</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{resourceToDelete?.name}
                &quot;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setDeleteResourceDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  resourceToDelete && handleDeleteResource(resourceToDelete.id)
                }
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Contact Confirmation Dialog */}
        <Dialog
          open={deleteContactDialogOpen}
          onOpenChange={setDeleteContactDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Contact</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;
                {contactToDelete?.fullName}&quot;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setDeleteContactDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  contactToDelete && handleDeleteContact(contactToDelete.id)
                }
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
