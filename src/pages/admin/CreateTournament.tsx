
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

// Form schema
const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  game: z.string().min(1, "Please select a game"),
  gameType: z.string().min(1, "Please select a game type"),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  entryFee: z.string().min(1, "Entry fee is required"),
  prizePool: z.string().min(1, "Prize pool is required"),
  maxSlots: z.string().min(1, "Max slots is required"),
  description: z.string().optional(),
  bannerImage: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CreateTournament = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      game: "",
      gameType: "",
      date: "",
      time: "",
      entryFee: "",
      prizePool: "",
      maxSlots: "",
      description: "",
      bannerImage: "",
    },
  });

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
  
  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    
    // Mock API call - in a real app, this would be an API call
    setTimeout(() => {
      console.log("Tournament data:", data);
      
      toast({
        title: "Tournament Created",
        description: "The tournament has been successfully created.",
      });
      
      setIsSubmitting(false);
      navigate("/admin/tournaments");
    }, 1000);
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            className="flex items-center text-gray-400 hover:text-white mr-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-white">Create New Tournament</h1>
        </div>
        
        <div className="bg-esports-dark border border-esports-accent/20 rounded-lg p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Tournament Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter tournament title" 
                          {...field}
                          className="bg-esports-darker border-esports-accent/20 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="game"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Game</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-esports-darker border-esports-accent/20 text-white">
                            <SelectValue placeholder="Select game" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                          <SelectItem value="BGMI">BGMI</SelectItem>
                          <SelectItem value="Valorant">Valorant</SelectItem>
                          <SelectItem value="COD">COD Mobile</SelectItem>
                          <SelectItem value="FreeFire">Free Fire</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="gameType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Game Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-esports-darker border-esports-accent/20 text-white">
                            <SelectValue placeholder="Select game type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                          <SelectItem value="Solo">Solo</SelectItem>
                          <SelectItem value="Duo">Duo</SelectItem>
                          <SelectItem value="Squad">Squad</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field}
                            className="bg-esports-darker border-esports-accent/20 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Time</FormLabel>
                        <FormControl>
                          <Input 
                            type="time" 
                            {...field}
                            className="bg-esports-darker border-esports-accent/20 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="entryFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Entry Fee (rdCoins)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          placeholder="Enter entry fee" 
                          {...field}
                          className="bg-esports-darker border-esports-accent/20 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="prizePool"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Prize Pool (rdCoins)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          placeholder="Enter prize pool" 
                          {...field}
                          className="bg-esports-darker border-esports-accent/20 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="maxSlots"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Max Slots</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1"
                          placeholder="Enter max slots" 
                          {...field}
                          className="bg-esports-darker border-esports-accent/20 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="col-span-1 md:col-span-2">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter tournament description" 
                            {...field}
                            className="bg-esports-darker border-esports-accent/20 text-white resize-none h-32"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <FormLabel className="text-white">Banner Image</FormLabel>
                  <div className="mt-2 flex flex-col space-y-4">
                    <Input
                      id="bannerImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="bg-esports-darker border-esports-accent/20 text-white"
                    />
                    
                    {imagePreview && (
                      <div className="mt-4">
                        <p className="text-white text-sm mb-2">Image Preview:</p>
                        <img 
                          src={imagePreview} 
                          alt="Banner preview" 
                          className="max-h-48 rounded-md border border-esports-accent/20"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="mr-4 border-esports-accent/20 text-white"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-esports-accent hover:bg-esports-accent/80 text-white"
                >
                  {isSubmitting ? "Creating..." : "Create Tournament"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreateTournament;
