"use client";

import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";

const AdminProducts = () => {
  const { user } = useAppContext();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    price: "",
    offerPrice: "",
    image: "",
    description: "",
    inStock: true,
    isBestSeller: false,
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/products", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/admin/categories", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      if (productsData.success) setProducts(productsData.products);
      if (categoriesData.success) setCategories(categoriesData.categories);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const startCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      categoryId: categories[0]?.id || "",
      price: "",
      offerPrice: "",
      image: "",
      description: "",
      inStock: true,
      isBestSeller: false,
    });
    setShowForm(true);
  };

  const startEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      categoryId: product.categoryId,
      price: product.price,
      offerPrice: product.offerPrice || "",
      image: product.image?.[0] || "",
      description: product.description?.join(", ") || "",
      inStock: product.inStock,
      isBestSeller: product.isBestSeller,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: formData.name,
        categoryId: formData.categoryId,
        price: parseFloat(formData.price),
        offerPrice: formData.offerPrice ? parseFloat(formData.offerPrice) : null,
        images: formData.image ? [formData.image] : [],
        description: formData.description
          ? formData.description.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        inStock: formData.inStock,
        isBestSeller: formData.isBestSeller,
      };

      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : "/api/admin/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editingProduct ? "Product updated" : "Product created");
        setShowForm(false);
        setEditingProduct(null);
        fetchData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to save product");
    }
  };

  const handleDelete = async (product) => {
    if (!confirm(`Delete "${product.name}"?`)) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Product deleted");
        fetchData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  if (loading) {
    return <div className="py-24 text-center text-gray-500">Loading products...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-medium">Products</h1>
        <button
          onClick={startCreate}
          className="px-4 py-2 bg-primary hover:bg-primary-dull text-white rounded cursor-pointer text-sm"
        >
          + Add Product
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-lg p-6 mb-6"
        >
          <h2 className="font-medium text-lg mb-4">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 block mb-1">
                Product Name
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="border border-gray-300 rounded px-3 py-2 w-full outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">
                Category
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                required
                className="border border-gray-300 rounded px-3 py-2 w-full outline-none focus:border-primary bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">
                Price (₹)
              </label>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                required
                className="border border-gray-300 rounded px-3 py-2 w-full outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">
                Offer Price (₹) <span className="text-gray-400">(optional)</span>
              </label>
              <input
                name="offerPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.offerPrice}
                onChange={handleInputChange}
                className="border border-gray-300 rounded px-3 py-2 w-full outline-none focus:border-primary"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm text-gray-600 block mb-1">
                Image URL
              </label>
              <input
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="/images/products/potato_image_1.png"
                className="border border-gray-300 rounded px-3 py-2 w-full outline-none focus:border-primary"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm text-gray-600 block mb-1">
                Description <span className="text-gray-400">(comma separated)</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={2}
                className="border border-gray-300 rounded px-3 py-2 w-full outline-none focus:border-primary"
              />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={handleInputChange}
                  className="accent-primary"
                />
                <span className="text-sm text-gray-600">In Stock</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isBestSeller"
                  checked={formData.isBestSeller}
                  onChange={handleInputChange}
                  className="accent-primary"
                />
                <span className="text-sm text-gray-600">Best Seller</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="px-6 py-2 bg-primary hover:bg-primary-dull text-white rounded cursor-pointer text-sm"
            >
              {editingProduct ? "Update Product" : "Create Product"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingProduct(null);
              }}
              className="px-6 py-2 border border-gray-300 text-gray-600 rounded cursor-pointer text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Edit</th>
              <th className="px-4 py-3">Delete</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image?.[0] || "/images/logo.svg"}
                      alt=""
                      className="w-10 h-10 object-contain"
                    />
                    <span className="font-medium">{product.name}</span>
                    {product.isBestSeller && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        Best Seller
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {product.category?.name}
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium">₹{product.offerPrice || product.price}</span>
                  {product.offerPrice && (
                    <span className="text-gray-400 line-through text-xs ml-1">
                      ₹{product.price}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {product.inStock ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      In Stock
                    </span>
                  ) : (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      Out
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => startEdit(product)}
                    className="text-sm text-blue-500 hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(product)}
                    className="text-sm text-red-500 hover:underline cursor-pointer"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;