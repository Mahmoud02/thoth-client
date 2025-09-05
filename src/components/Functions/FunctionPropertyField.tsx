import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FunctionProperty } from '@/types';

interface FunctionPropertyFieldProps {
  property: FunctionProperty;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

const FunctionPropertyField: React.FC<FunctionPropertyFieldProps> = ({
  property,
  value,
  onChange,
  error
}) => {
  const renderField = () => {
    switch (property.type) {
      case 'Long':
      case 'Integer':
        return (
          <Input
            type="number"
            value={value || property.defaultValue || ''}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            placeholder={property.description}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'String':
        return (
          <Input
            type="text"
            value={value || property.defaultValue || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={property.description}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'Boolean':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={value !== undefined ? value : property.defaultValue || false}
              onCheckedChange={(checked) => onChange(checked)}
            />
            <Label className="text-sm">{property.description}</Label>
          </div>
        );

      case 'List<String>':
        const listValue = value || property.defaultValue || [];
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {listValue.map((item: string, index: number) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {item}
                  <button
                    type="button"
                    onClick={() => {
                      const newList = listValue.filter((_: any, i: number) => i !== index);
                      onChange(newList);
                    }}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              placeholder="Add new item and press Enter"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const input = e.target as HTMLInputElement;
                  const newItem = input.value.trim();
                  if (newItem && !listValue.includes(newItem)) {
                    onChange([...listValue, newItem]);
                    input.value = '';
                  }
                }
              }}
              className={error ? 'border-red-500' : ''}
            />
          </div>
        );

      default:
        return (
          <Input
            type="text"
            value={value || property.defaultValue || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={property.description}
            className={error ? 'border-red-500' : ''}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {property.name}
        {property.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderField()}
      {property.description && (
        <p className="text-xs text-slate-500">{property.description}</p>
      )}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};

export default FunctionPropertyField;
