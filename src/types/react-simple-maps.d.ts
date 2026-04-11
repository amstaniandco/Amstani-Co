declare module "react-simple-maps" {
  import * as React from "react";

  export type GeographyFeature = {
    rsmKey: string;
    properties?: {
      NAME?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };

  type GeographyStyle = {
    fill?: string;
    outline?: string;
    stroke?: string;
    strokeWidth?: number | string;
    cursor?: string;
  };

  type GeographyStyles = {
    default?: GeographyStyle;
    hover?: GeographyStyle;
    pressed?: GeographyStyle;
  };

  export interface ComposableMapProps extends React.SVGProps<SVGSVGElement> {
    projection?: string;
    width?: number;
    height?: number;
    children?: React.ReactNode;
  }

  export const ComposableMap: React.FC<ComposableMapProps>;

  export interface GeographiesRenderProps {
    geographies: GeographyFeature[];
  }

  export interface GeographiesProps {
    geography: string | object;
    children: (args: GeographiesRenderProps) => React.ReactNode;
  }

  export const Geographies: React.FC<GeographiesProps>;

  export interface GeographyProps extends React.SVGProps<SVGPathElement> {
    geography: GeographyFeature;
    style?: GeographyStyles;
  }

  export const Geography: React.FC<GeographyProps>;
}
