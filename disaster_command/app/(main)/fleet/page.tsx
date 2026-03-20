'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Battery, Drone, Info, Weight, Package, Activity, ShieldCheck, ArrowRight } from "lucide-react"

interface DroneData {
  id: string
  drone_name: string
 
  battery: number
  status: 'active' | 'inactive' | 'maintenance' | 'deployed'

  weight_class: string
  "max_load(kg)": number
  image_url?: string
}

const Fleet = () => {
  const [drones, setDrones] = useState<DroneData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDrone, setSelectedDrone] = useState<DroneData | null>(null)

  useEffect(() => {
    const fetchDrones = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('drone_fleet')
        .select('*')
      
      if (error) {
        console.error('Error fetching drones:', error)
      } else {
        setDrones(data || [])
      }
      setLoading(false)
    }

    fetchDrones()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-500 hover:bg-green-600'
      case 'deployed': return 'bg-blue-500 hover:bg-blue-600'
      case 'maintenance': return 'bg-yellow-500 hover:bg-yellow-600'
      case 'inactive': return 'bg-red-500 hover:bg-red-600'
      default: return 'bg-gray-500'
    }
  }

  const getBatteryColor = (level: number) => {
    if (level > 70) return 'text-green-500'
    if (level > 30) return 'text-yellow-500'
    return 'text-red-500'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Drone Fleets</h1>
        <p className="text-muted-foreground">View and manage all drones currently in your drone fleet</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {drones.length > 0 ? (
            drones.map((drone, index) => (
              <motion.div
                key={drone.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Sheet>
                  <SheetTrigger asChild>
                    <Card className="overflow-hidden cursor-pointer border-2 hover:border-primary transition-all duration-300 h-full flex flex-col group">
                      <div className="relative aspect-video w-full bg-muted overflow-hidden">
                        <img 
                          src={drone.image_url || `https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=400&auto=format&fit=crop`} 
                          alt={drone.drone_name}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className={`${getStatusColor(drone.status)} text-white border-none`}>
                            {drone.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl font-bold">{drone.drone_name}</CardTitle>
                   
                          </div>
                          <div className={`flex items-center gap-1 font-bold ${getBatteryColor(drone.battery)}`}>
                            <Battery className="w-4 h-4" />
                            <span>{drone.battery}%</span>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardFooter className="pt-0 pb-4 flex justify-between items-center">
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          Click for more details
                        </div>
                        <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
                          Details
                        </Button>
                      </CardFooter>
                    </Card>
                  </SheetTrigger>
                  <SheetContent side="right" className="sm:max-w-md">
                    <SheetHeader className="text-left">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Drone className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <SheetTitle className="text-2xl font-bold">{drone.drone_name}</SheetTitle>
                         
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(drone.status)} text-white w-fit px-4 py-1 mb-6`}>
                        {drone.status.toUpperCase()}
                      </Badge>
                    </SheetHeader>
                    
                    <div className="space-y-6 mt-6">
                      <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                        <img 
                          src={drone.image_url || `https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=400&auto=format&fit=crop`} 
                          alt={drone.drone_name}
                          className="object-cover w-full h-full"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                          <Battery className={`w-6 h-6 ${getBatteryColor(drone.battery)}`} />
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Battery Status</p>
                            <p className="text-lg font-bold">{drone.battery}% Remaining</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                          <Weight className="w-6 h-6 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Weight Class</p>
                            <p className="text-lg font-bold">{drone.weight_class}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                          <Package className="w-6 h-6 text-orange-500" />
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Max Payload</p>
                            <p className="text-lg font-bold">{drone["max_load(kg)"]} Kg</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                          <ShieldCheck className="w-6 h-6 text-green-500" />
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Operational Status</p>
                            <p className="text-lg font-bold capitalize">{drone.status}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <SheetFooter className="absolute bottom-6 left-6 right-6 flex-col gap-3">
                      <SheetClose asChild>
                        <Button variant="outline" className="w-full">Close Panel</Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <Drone className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
              <h2 className="text-2xl font-semibold mb-2">No Drones Found</h2>
              <p className="text-muted-foreground mb-6">Your fleet is currently empty. Add drones to your Supabase database to see them here.</p>
              <Button onClick={() => window.location.reload()}>Refresh Database</Button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Fleet