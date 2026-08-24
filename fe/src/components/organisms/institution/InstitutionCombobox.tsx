import { useState } from "react";

import { Button } from "@/components/atoms/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/atoms/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/atoms/popover";
import type { InstitutionResponse } from "@/types/api/institution.types";
import { Building2, ChevronsUpDown } from "lucide-react";

export function InstitutionCombobox({
  institutions,
  value,
  onChange,
}: {
  institutions: InstitutionResponse[];
  value: string;
  onChange: (institutionId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = institutions.find((item) => item.id === value) ?? null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          // biome-ignore lint/a11y/useSemanticElements: Using combobox role for radix popover trigger
          role="combobox"
          aria-expanded={open}
          className="h-[42px] w-full justify-start border-2 border-gray-100 rounded-lg px-4 font-normal text-gray-800"
        >
          {selected ? (
            <span className="flex items-center gap-2 text-foreground">
              <Building2 className="size-4 shrink-0 " />
              {selected.name}
              {selected.city ? (
                <span className="text-muted-foreground">— {selected.city}</span>
              ) : null}
            </span>
          ) : (
            <span className="text-muted-foreground">
              Cari & pilih institusi…
            </span>
          )}
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(28rem,calc(100vw-2rem))] p-0"
      >
        <Command>
          <CommandInput placeholder="Cari nama institusi…" />
          <CommandList>
            <CommandEmpty>Institusi tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {institutions.map((institution) => (
                <CommandItem
                  key={institution.id}
                  value={institution.name ?? institution.id}
                  onSelect={() => {
                    onChange(institution.id);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Building2 className="size-4" />
                  <span className="text-foreground">{institution.name}</span>
                  {institution.province ? (
                    <span className="">
                      — {institution.province}
                      {institution.city ? `, ${institution.city}` : ""}
                    </span>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
