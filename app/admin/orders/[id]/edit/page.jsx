'use client';

import { use } from 'react';
import OrderForm from '../../_components/OrderForm.jsx';

export default function OrderEditPage(props) {
  const resolvedParams = props?.params && typeof props.params.then === 'function'
    ? use(props.params)
    : (props?.params || {});

  return <OrderForm id={resolvedParams?.id} />;
}
