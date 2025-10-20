'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { allCountries } from '@/app/(main)/masters/data/zones';

interface CountryFilterProps {
  selectedCountry: string | 'all';
  onCountryChange: (value: string | 'all') => void;
}

export function CountryFilter({ selectedCountry, onCountryChange }: CountryFilterProps) {
  return (
    <Select value={selectedCountry} onValueChange={onCountryChange}>
      <SelectTrigger className="w-[180px]">
        <Globe className="mr-2 h-4 w-4" />
        <SelectValue placeholder="Filtrar por país" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos los países</SelectItem>
        {allCountries.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            {country.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
