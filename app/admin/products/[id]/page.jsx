'use client';

import { use } from 'react';
import ProductForm from '../_components/ProductForm.jsx';

export default function ProductDetailPage(props) {
  const resolvedParams = props?.params && typeof props.params.then === 'function'
    ? use(props.params)
    : (props?.params || {});

  return <ProductForm id={resolvedParams?.id} />;
}
