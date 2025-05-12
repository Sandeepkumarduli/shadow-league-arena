
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";

// Form schema
const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  game: z.string().min(1, "Please select a game"),
  gameType: z.string().min(1, "Please select a game type"),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  entryFeeType: z.enum(["free", "paid"]),
  entryFee: z.string().optional(),
  prizePool: z.string().min(1, "Prize pool is required"),
  maxSlots: z.string().min(1, "Max slots is required"),
  description: z.string().optional(),
  distributeToTopThree: z.boolean().default(false),
  firstPlacePrize: z.string().optional(),
  secondPlacePrize: z.string().optional(),
  thirdPlacePrize: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CreateTournament = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      game: "",
      gameType: "",
      date: "",
      time: "",
      entryFeeType: "free",
      entryFee: "",
      prizePool: "",
      maxSlots: "",
      description: "",
      distributeToTopThree: false,
      firstPlacePrize: "",
      secondPlacePrize: "",
      thirdPlacePrize: "",
    },
  });

  const watchEntryFeeType = form.watch("entryFeeType");
  const watchDistributeToTopThree = form.watch("distributeToTopThree");
  const watchPrizePool = form.watch("prizePool");
  
  // Calculate remaining prize amount as user inputs values
  const calculateRemainingPrize = () => {
    if (!watchDistributeToTopThree || !watchPrizePool) return "";
    
    const totalPool = parseInt(watchPrizePool) || 0;
    const first = parseInt(form.watch("firstPlacePrize")) || 0;
    const second = parseInt(form.watch("secondPlacePrize")) || 0;
    const third = parseInt(form.watch("thirdPlacePrize")) || 0;
    
    return Math.max(0, totalPool - first - second - third).toString();
  };
  
  const remainingPrize = calculateRemainingPrize();
  
  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    
    // Validation for prize distribution
    if (data.distributeToTopThree) {
      const totalPrize = parseInt(data.prizePool) || 0;
      const first = parseInt(data.firstPlacePrize || "0");
      const second = parseInt(data.secondPlacePrize || "0");
      const third = parseInt(data.thirdPlacePrize || "0");
      
      if (first + second + third > totalPrize) {
        toast({
          title: "Error",
          description: "Prize distribution exceeds total prize pool",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      if (first + second + third < totalPrize) {
        toast({
          title: "Warning",
          description: "Not all prize money has been allocated. The remainder will stay in the admin account.",
        });
      }
    }
    
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
                  name="entryFeeType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-white">Entry Fee</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="free" id="free" />
                            <Label htmlFor="free" className="text-white">Free</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="paid" id="paid" />
                            <Label htmlFor="paid" className="text-white">Paid</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {watchEntryFeeType === "paid" && (
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
                )}
                
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
                    name="distributeToTopThree"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 bg-esports-darker/50">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-white">
                            Distribute prize among top 3 teams
                          </FormLabel>
                          <p className="text-sm text-gray-400">
                            If unchecked, all prize money goes to the winner
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                {watchDistributeToTopThree && (
                  <div className="col-span-1 md:col-span-2">
                    <Card className="bg-esports-darker/50 border-esports-accent/20 p-4">
                      <h3 className="text-white font-semibold mb-4">Prize Distribution</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="firstPlacePrize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">1st Place (rdCoins)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0"
                                  placeholder="Enter amount" 
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
                          name="secondPlacePrize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">2nd Place (rdCoins)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0"
                                  placeholder="Enter amount" 
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
                          name="thirdPlacePrize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">3rd Place (rdCoins)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0"
                                  placeholder="Enter amount" 
                                  {...field}
                                  className="bg-esports-darker border-esports-accent/20 text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="mt-4 flex justify-between">
                        <div className="text-white">
                          <span className="text-gray-400">Total Prize Pool: </span>
                          {watchPrizePool || "0"} rdCoins
                        </div>
                        <div className={`${parseInt(remainingPrize) < 0 ? 'text-red-500' : 'text-green-500'}`}>
                          <span className="text-gray-400">Remaining: </span>
                          {remainingPrize || "0"} rdCoins
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
                
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
