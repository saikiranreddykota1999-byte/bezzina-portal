import { notFound } from 'next/navigation';
import { getCustomerOrderByNumber } from '@/actions/pickup';
import { OrderReceipt } from '@/components/orders/order-receipt';

type Props = {
  params: Promise<{ orderNumber: string }>;
};

export default async function OrderReceiptPage({ params }: Props) {
  const { orderNumber } = await params;
  const result = await getCustomerOrderByNumber(decodeURIComponent(orderNumber));

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="py-4">
      <OrderReceipt order={result.data} />
    </div>
  );
}
