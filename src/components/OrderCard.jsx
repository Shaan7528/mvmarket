import { Link } from 'react-router-dom'
import { formatPrice, formatDate } from '../utils/format'
import { ORDER_STATUS } from '../utils/constants'

const statusColors = {
  [ORDER_STATUS.PENDING]: 'bg-amber-100 text-amber-700',
  [ORDER_STATUS.CONFIRMED]: 'bg-blue-100 text-blue-700',
  [ORDER_STATUS.DELIVERED]: 'bg-green-100 text-green-700',
  [ORDER_STATUS.CANCELLED]: 'bg-red-100 text-red-700',
}

export function OrderCard({ order, linkPrefix = '/orders' }) {
  return (
    <Link
      to={`${linkPrefix}/${order.id}`}
      className="block p-4 rounded-2xl bg-white border border-neutral-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-neutral-400">#{order.id?.slice(-6)}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColors[order.status]}`}>
          {order.status}
        </span>
      </div>
      <p className="text-sm font-semibold">{order.storeName}</p>
      <p className="text-xs text-neutral-500 mt-0.5">
        {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} · {formatDate(order.createdAt)}
      </p>
      <p className="text-sm font-bold mt-2">{formatPrice(order.total)}</p>
    </Link>
  )
}
