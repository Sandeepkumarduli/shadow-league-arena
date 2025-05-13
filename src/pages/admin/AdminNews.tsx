
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Image, Edit, Trash, PlusCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { 
  NewsItem, 
  fetchNews, 
  subscribeNewsChanges,
  createNewsItem,
  updateNewsItem,
  deleteNewsItem 
} from "@/services/newsService";
import LoadingSpinner from "@/components/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";

const AdminNews = () => {
  const navigate = useNavigate();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form states
  const [title, setTitle] = useState("");
  const [content, setDescription] = useState("");
  const [category, setCategory] = useState("News");
  const [link, setLink] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const unsubscribe = subscribeNewsChanges((fetchedNews) => {
      setNewsItems(fetchedNews);
      setLoading(false);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `news-images/${fileName}`;
      
      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('news-images')
        .upload(filePath, file);
      
      if (error) throw error;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('news-images')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };
  
  const handleAddNews = async () => {
    // Validate form
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for the news item.",
        variant: "destructive",
      });
      return;
    }
    
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter content for the news item.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload image if selected
      let imageUrl = null;
      if (fileInputRef.current?.files?.[0]) {
        imageUrl = await uploadImage(fileInputRef.current.files[0]);
      }
      
      // Create news item
      await createNewsItem({
        title,
        content,
        category,
        image_url: imageUrl
      });
      
      toast({
        title: "News Added",
        description: "The news item has been successfully added.",
      });
      
      // Reset form and close dialog
      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding news:', error);
      toast({
        title: "Error",
        description: "Failed to add news item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditNews = async () => {
    if (!selectedNewsId) return;
    
    // Validate form
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload image if selected
      let imageUrl = null;
      if (fileInputRef.current?.files?.[0]) {
        imageUrl = await uploadImage(fileInputRef.current.files[0]);
      }
      
      // Update news item
      await updateNewsItem(selectedNewsId, {
        title,
        content,
        category,
        image_url: imageUrl || undefined
      });
      
      toast({
        title: "News Updated",
        description: "The news item has been successfully updated.",
      });
      
      // Reset form and close dialog
      resetForm();
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating news:', error);
      toast({
        title: "Error",
        description: "Failed to update news item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteNews = (newsId: string) => {
    setSelectedNewsId(newsId);
    setIsDeleteDialogOpen(true);
  };
  
  const handleEditNewsOpen = (news: NewsItem) => {
    setSelectedNewsId(news.id);
    setTitle(news.title);
    setDescription(news.content);
    setCategory(news.category || "News");
    setImagePreview(news.image_url);
    setIsEditDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!selectedNewsId) return;
    
    try {
      await deleteNewsItem(selectedNewsId);
      
      toast({
        title: "News Deleted",
        description: "The news item has been successfully deleted.",
      });
      
      setSelectedNewsId(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting news:', error);
      toast({
        title: "Error",
        description: "Failed to delete news item. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("News");
    setLink("");
    setImagePreview(null);
    setIsActive(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm"
            className="flex items-center text-gray-400 hover:text-white mr-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-white">Edit News Section</h1>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-esports-accent hover:bg-esports-accent/80 text-white"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add News
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-esports-dark text-white border-esports-accent/20 max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add News Item</DialogTitle>
              <DialogDescription className="text-gray-400">
                Create a new news item to display on the homepage.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 my-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-white mb-1">
                  Title
                </label>
                <Input
                  id="title"
                  placeholder="Enter news title"
                  className="bg-esports-darker border-esports-accent/20 text-white"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-white mb-1">
                  Description
                </label>
                <Textarea
                  id="description"
                  placeholder="Enter news description"
                  className="bg-esports-darker border-esports-accent/20 text-white resize-none h-24"
                  value={content}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-white mb-1">
                  Category
                </label>
                <Input
                  id="category"
                  placeholder="Enter category (e.g., News, Update, Tournament)"
                  className="bg-esports-darker border-esports-accent/20 text-white"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-white mb-1">
                  Image
                </label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  className="bg-esports-darker border-esports-accent/20 text-white"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                />
                
                {imagePreview && (
                  <div className="mt-2">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-40 rounded-md object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => {
                  resetForm();
                  setIsAddDialogOpen(false);
                }}
                className="text-white"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleAddNews}
                disabled={isSubmitting}
                className="bg-esports-accent hover:bg-esports-accent/80"
              >
                {isSubmitting ? "Adding..." : "Add News"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Edit News Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-esports-dark text-white border-esports-accent/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit News Item</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update the selected news item.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div>
              <label htmlFor="edit-title" className="block text-sm font-medium text-white mb-1">
                Title
              </label>
              <Input
                id="edit-title"
                placeholder="Enter news title"
                className="bg-esports-darker border-esports-accent/20 text-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="edit-description" className="block text-sm font-medium text-white mb-1">
                Description
              </label>
              <Textarea
                id="edit-description"
                placeholder="Enter news description"
                className="bg-esports-darker border-esports-accent/20 text-white resize-none h-24"
                value={content}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="edit-category" className="block text-sm font-medium text-white mb-1">
                Category
              </label>
              <Input
                id="edit-category"
                placeholder="Enter category (e.g., News, Update, Tournament)"
                className="bg-esports-darker border-esports-accent/20 text-white"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="edit-image" className="block text-sm font-medium text-white mb-1">
                Image
              </label>
              <Input
                id="edit-image"
                type="file"
                accept="image/*"
                className="bg-esports-darker border-esports-accent/20 text-white"
                onChange={handleImageChange}
                ref={fileInputRef}
              />
              
              {imagePreview && (
                <div className="mt-2">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-40 rounded-md object-cover"
                  />
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                resetForm();
                setIsEditDialogOpen(false);
              }}
              className="text-white"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleEditNews}
              disabled={isSubmitting}
              className="bg-esports-accent hover:bg-esports-accent/80"
            >
              {isSubmitting ? "Updating..." : "Update News"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* News Items List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : newsItems.length > 0 ? (
          newsItems.map((news) => (
            <Card key={news.id} className="bg-esports-dark border-esports-accent/20">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="md:w-1/4">
                    <div className="relative aspect-video w-full">
                      <img
                        src={news.image_url || "https://placehold.co/800x400/1977d4/FFF?text=News"}
                        alt={news.title}
                        className="rounded-md object-cover w-full h-full"
                      />
                    </div>
                  </div>
                  
                  <div className="md:w-3/4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{news.title}</h3>
                      <p className="text-gray-300 text-sm mb-2">{news.content}</p>
                      <div className="flex items-center text-xs text-gray-400">
                        <span>Created: {new Date(news.created_at).toLocaleString()}</span>
                        <span className="ml-4">Category: {news.category || "News"}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center mt-4 space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-esports-accent/20 text-white hover:bg-esports-accent/10"
                        onClick={() => handleEditNewsOpen(news)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        className="bg-red-900/20 hover:bg-red-900/40 text-red-500"
                        onClick={() => handleDeleteNews(news.id)}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 bg-esports-dark rounded-lg border border-esports-accent/20">
            <p className="text-gray-400">No news items found. Add your first news item using the button above.</p>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-esports-dark text-white border-esports-accent/20">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this news item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="text-white"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="bg-red-900/20 hover:bg-red-900/40 text-red-500"
            >
              Delete News
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminNews;
