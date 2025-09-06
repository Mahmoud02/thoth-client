import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GripVerticalIcon, TrashIcon, SettingsIcon } from 'lucide-react';
import { AvailableFunction, FunctionProperty } from '@/types';
import FunctionPropertyField from './FunctionPropertyField';

interface ConfiguredFunctionProps {
  function: AvailableFunction;
  configuration: any;
  onUpdate: (configuration: any) => void;
  onRemove: () => void;
  onReorder: (direction: 'up' | 'down') => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

const ConfiguredFunction: React.FC<ConfiguredFunctionProps> = ({
  function: func,
  configuration,
  onUpdate,
  onRemove,
  onReorder,
  canMoveUp,
  canMoveDown
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePropertyChange = (propertyName: string, value: any) => {
    const newConfiguration = {
      ...configuration,
      [propertyName]: value
    };
    
    // Validate required fields
    const newErrors: Record<string, string> = {};
    func.properties.forEach(prop => {
      if (prop.required && (!newConfiguration[prop.name] || newConfiguration[prop.name] === '')) {
        newErrors[prop.name] = `${prop.name} is required`;
      }
    });
    
    setErrors(newErrors);
    onUpdate(newConfiguration);
  };

  const getIcon = (functionType: string) => {
    // Dynamic icon mapping - can be extended for new function types
    const iconMap: Record<string, string> = {
      'SIZE_LIMIT': '⚖️',
      'EXTENSION_VALIDATOR': '📄',
      'CONTENT_VALIDATOR': '✅',
      'NAME_VALIDATOR': '🛡️',
    };
    return iconMap[functionType] || '⚙️';
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Card className={`${hasErrors ? 'border-red-200 bg-red-50' : 'border-slate-200'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{getIcon(func.functionType)}</div>
            <div>
              <h4 className="font-medium text-sm">{func.functionName}</h4>
              <p className="text-xs text-slate-500">{func.description}</p>
            </div>
            {hasErrors && (
              <Badge variant="destructive" className="text-xs">
                Configuration Error
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReorder('up')}
              disabled={!canMoveUp}
            >
              ↑
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReorder('down')}
              disabled={!canMoveDown}
            >
              ↓
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <SettingsIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-red-500 hover:text-red-700"
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-4 pt-3 border-t border-slate-200">
            {func.properties.map((property: FunctionProperty) => (
              <FunctionPropertyField
                key={property.name}
                property={property}
                value={configuration[property.name]}
                onChange={(value) => handlePropertyChange(property.name, value)}
                error={errors[property.name]}
              />
            ))}
          </div>
        )}

        {!isExpanded && (
          <div className="text-xs text-slate-500">
            Click settings to configure properties
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConfiguredFunction;
