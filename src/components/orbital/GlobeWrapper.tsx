'use client';

import React from 'react';
import Globe, { type GlobeMethods, type GlobeProps } from 'react-globe.gl';

type GlobeWrapperProps = GlobeProps & {
  globeRef: React.MutableRefObject<GlobeMethods | undefined>;
};

// next/dynamic does not forward refs, so the globe ref travels as a plain
// prop through the dynamic boundary and is attached here.
const GlobeWrapper: React.FC<GlobeWrapperProps> = ({ globeRef, ...props }) => <Globe {...props} ref={globeRef} />;

export default GlobeWrapper;
