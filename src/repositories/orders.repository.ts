import { Model } from "mongoose";
import OrderModel from './../models/orders.model';
import { OrderInterface } from "../interfaces/orders.interface";
import { PaginationResponseInterface } from "../interfaces/response.interface";

class OrdersRepository {
  private readonly model: Model<OrderInterface>;

  constructor() {
    this.model = OrderModel;
  }

  /**
   * Find model by query
   * @param query
   * @returns
   */
  public async findOneByQuery(query: any): Promise<OrderInterface | null> {
    return await this.model.findOne(query);
  }

  /**
   * Save order in bbdd
   * @param user User
   */
  public async create(order: OrderInterface): Promise<OrderInterface> {
    const orderBd = await this.model.create(order);
    return orderBd;
  }

  /**
   * Update order data
   * @param id
   * @param body
   */
  public async update(
    id: string | undefined,
    body: OrderInterface
  ): Promise<OrderInterface | void | null> {
    return await this.model.findByIdAndUpdate(id, body, { new: true });
  }

  /**
   * Paginate orders
   * @param query - Query object for filtering results
   * @param skip - Number of documents to skip
   * @param perPage - Number of documents per page
   * @param sortBy - Field to sort by (default: "name")
   * @param order - Sort order (1 for ascending, -1 for descending, default: "1")
   */
  public async paginate(
    query: Record<string, any>,
    skip: number,
    perPage: number,
    sortBy: string = "name",
    order: any = "-1",
    fields: string[] = []
  ): Promise<PaginationResponseInterface> {
    try {
      // Parse sort order to ensure it is a number

      const validSortFields = ["name", "createdAt"];
      if (!validSortFields.includes(sortBy)) {
        throw new Error(
          `Invalid sort field. Allowed fields are: ${validSortFields.join(
            ", "
          )}`
        );
      }

      // Fetch paginated data
      const orders = await this.model
        .find(query)
        .sort({ [sortBy]: order })
        .select(fields.length > 0 ? fields.join(" ") : "")
        .skip(skip)
        .limit(perPage);

      // Get total count of matching documents
      const totalorders = await this.model.countDocuments(query);

      // Calculate total pages
      const totalPages = Math.ceil(totalorders / perPage);

      return {
        data: orders,
        totalPages,
        totalItems: totalorders,
      };
    } catch (error: any) {
      throw new Error(`Pagination failed: ${error.message}`);
    }
  }

  /**
   * Delete order by id
   * @param id
   */
  public async delete(id: string): Promise<OrderInterface | void | null> {
    return this.model.findByIdAndDelete(id);
  }

  /**
   * get by id
   * @param id
   */
  public async findById(id: string): Promise<OrderInterface | null> {
    return await this.model.findById(id);
  }
}

export default OrdersRepository;
