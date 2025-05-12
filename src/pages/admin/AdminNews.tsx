
import { useState } from "react";
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

// Sample news items
const newsData = [
  {
    id: "1",
    title: "BGMI Pro League Season 5 Announced",
    description: "Join the biggest mobile gaming tournament with a prize pool of 5,000 rdCoins. Registration opens next week!",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    link: "/tournaments",
    createdAt: "2023-05-05",
    active: true
  },
  {
    id: "2",
    title: "New Valorant Tournament Format",
    description: "We're introducing a new bracket system for Valorant tournaments with double elimination rounds.",
    image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    link: "/valorant-tournaments",
    createdAt: "2023-05-02",
    active: true
  },
  {
    id: "3",
    title: "Platform Maintenance Notice",
    description: "The platform will be undergoing maintenance on May 20th from 2 AM to 5 AM. Some features may be unavailable during this time.",
    image: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    link: "/announcement",
    createdAt: "2023-04-28",
    active: false
  }
];

const AdminNews = () => {
  const navigate = useNavigate();
  const [newsItems, setNewsItems] = useState(newsData);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [isActive, setIsActive] = useState(true);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target) {
          setImagePreview(event.target.result as string);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  const handleAddNews = () => {
    // Validate form
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for the news item.",
        variant: "destructive",
      });
      return;
    }
    
    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description for the news item.",
        variant: "destructive",
      });
      return;
    }
    
    if (!imagePreview) {
      toast({
        title: "Error",
        description: "Please select an image for the news item.",
        variant: "destructive",
      });
      return;
    }
    
    // Create new news item
    const newNewsItem = {
      id: (newsItems.length + 1).toString(),
      title,
      description,
      image: imagePreview,
      link,
      createdAt: new Date().toISOString().split('T')[0],
      active: isActive
    };
    
    // Update state
    setNewsItems([newNewsItem, ...newsItems]);
    
    // Show success message
    toast({
      title: "News Added",
      description: "The news item has been successfully added.",
    });
    
    // Reset form and close dialog
    resetForm();
    setIsAddDialogOpen(false);
  };
  
  const handleDeleteNews = (newsId: string) => {
    setSelectedNewsId(newsId);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (!selectedNewsId) return;
    
    // Filter out the deleted news item
    setNewsItems(newsItems.filter(item => item.id !== selectedNewsId));
    
    // Show success message
    toast({
      title: "News Deleted",
      description: "The news item has been successfully deleted.",
    });
    
    // Reset state and close dialog
    setSelectedNewsId(null);
    setIsDeleteDialogOpen(false);
  };
  
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLink("");
    setImagePreview(null);
    setIsActive(true);
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="link" className="block text-sm font-medium text-white mb-1">
                  Link (Optional)
                </label>
                <Input
                  id="link"
                  placeholder="Enter link URL"
                  className="bg-esports-darker border-esports-accent/20 text-white"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
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
              
              <div className="flex items-center space-x-2">
                <input
                  id="active"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded bg-esports-darker border-esports-accent"
                />
                <label htmlFor="active" className="text-sm font-medium text-white">
                  Active (visible on homepage)
                </label>
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
                className="bg-esports-accent hover:bg-esports-accent/80"
              >
                Add News
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* News Items List */}
      <div className="space-y-4">
        {newsItems.map((news) => (
          <Card key={news.id} className="bg-esports-dark border-esports-accent/20">
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/4">
                  <div className="relative aspect-video w-full">
                    <img
                      src={news.image}
                      alt={news.title}
                      className="rounded-md object-cover w-full h-full"
                    />
                    {!news.active && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-md">
                        <span className="text-white text-sm font-medium px-2 py-1 bg-black/60 rounded">Inactive</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="md:w-3/4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{news.title}</h3>
                    <p className="text-gray-300 text-sm mb-2">{news.description}</p>
                    <div className="flex items-center text-xs text-gray-400">
                      <span>Created: {news.createdAt}</span>
                      {news.link && (
                        <span className="ml-4">
                          Link: <a href={news.link} className="text-esports-accent hover:underline" target="_blank" rel="noopener noreferrer">{news.link}</a>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-4 space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-esports-accent/20 text-white hover:bg-esports-accent/10"
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
        ))}
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
