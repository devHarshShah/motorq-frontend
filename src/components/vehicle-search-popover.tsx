'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VehiclesService, VehicleSearchResult } from '@/services/vehicles.service';
import { Car, Clock, MapPin, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';

interface VehicleSearchPopoverProps {
  onVehicleSelect: (vehicle: VehicleSearchResult) => void;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  includeActive?: boolean;
}

export function VehicleSearchPopover({
  onVehicleSelect,
  placeholder = "Enter vehicle number plate",
  value = "",
  disabled = false,
  includeActive = false
}: VehicleSearchPopoverProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value);
  const [results, setResults] = useState<VehicleSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const debouncedQuery = useDebounce(searchQuery, 300);

  const searchVehicles = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    try {
      setIsLoading(true);
      const searchResults = await VehiclesService.searchVehiclesRealtime(
        query,
        10,
        includeActive
      );
      setResults(searchResults);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Error searching vehicles:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [includeActive]);

  useEffect(() => {
    if (debouncedQuery && open) {
      searchVehicles(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery, open, searchVehicles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    setSearchQuery(newValue);
    if (newValue.length >= 2 && !open) {
      setOpen(true);
    }
  };

  const handleVehicleSelect = (vehicle: VehicleSearchResult) => {
    setSearchQuery(vehicle.numberPlate);
    setOpen(false);
    onVehicleSelect(vehicle);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleVehicleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const formatDuration = (entryTime: string) => {
    const entry = new Date(entryTime);
    const now = new Date();
    const durationMs = now.getTime() - entry.getTime();
    const hours = durationMs / (1000 * 60 * 60);
    
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes}m`;
    } else {
      const wholeHours = Math.floor(hours);
      const minutes = Math.round((hours - wholeHours) * 60);
      return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="pl-10"
            onFocus={() => {
              if (searchQuery.length >= 2) {
                setOpen(true);
              }
            }}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Searching...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              <div className="px-3 py-1 text-xs font-medium text-muted-foreground border-b">
                {results.length} vehicle{results.length !== 1 ? 's' : ''} found
              </div>
              {results.map((vehicle, index) => (
                <Button
                  key={vehicle.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start p-3 h-auto font-normal hover:bg-accent",
                    selectedIndex === index && "bg-accent"
                  )}
                  onClick={() => handleVehicleSelect(vehicle)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex-shrink-0">
                      <Car className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{vehicle.numberPlate}</span>
                        <Badge variant="outline" className="text-xs">
                          {vehicle.type}
                        </Badge>
                        {vehicle.isActive && (
                          <Badge variant="destructive" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                      {vehicle.activeSession ? (
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {vehicle.activeSession.slot.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(vehicle.activeSession.entryTime)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          {vehicle.totalSessions} previous session{vehicle.totalSessions !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          ) : searchQuery.length >= 2 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Car className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-muted-foreground">No vehicles found</p>
              <p className="text-xs text-muted-foreground">
                Try a different search term
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Search className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-muted-foreground">Start typing to search</p>
              <p className="text-xs text-muted-foreground">
                Enter at least 2 characters
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}