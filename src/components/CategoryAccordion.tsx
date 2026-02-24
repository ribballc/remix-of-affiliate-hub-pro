import { ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AffiliateLinkCard } from "./AffiliateLinkCard";
import type { Category } from "@/data/affiliateLinks";

interface CategoryAccordionProps {
  categories: Category[];
}

export function CategoryAccordion({ categories }: CategoryAccordionProps) {
  return (
    <Accordion type="multiple" defaultValue={categories.map(c => c.id)} className="space-y-3">
      {categories.map((category) => (
        <div key={category.id} className="relative">
          {category.isNew && (
            <span className="new-badge z-10">New Tool</span>
          )}
          <AccordionItem
            value={category.id}
            className="bg-card border border-border rounded-xl overflow-hidden shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-primary/10 transition-shadow duration-300"
          >
          <AccordionTrigger className="category-trigger hover:no-underline px-4">
            <span className="flex items-center gap-3">
              <span className="text-lg">{category.emoji}</span>
              {category.name}
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-3">
              {category.links.map((link) => (
                <AffiliateLinkCard key={link.id} link={link} />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        </div>
      ))}
    </Accordion>
  );
}
