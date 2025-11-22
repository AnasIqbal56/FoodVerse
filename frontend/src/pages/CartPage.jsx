
import { IoIosArrowRoundBack } from "react-icons/io";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CartItemCard from "../components/CartItemCard";
import bgImage from "../assets/generated-image.png";

function CartPage() {
  const navigate = useNavigate();
  const { cartItems, totalAmount } = useSelector(state => state.user)
  return (
    <div className="min-h-screen flex justify-center p-6" style={{ backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.75), rgba(0,0,0,0.75)), url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="w-full max-w-[800px]">
        <div className="flex items-center gap-[20px] mb-6">
          <div
            className="z-[10]"
            onClick={() => navigate("/home")}
          >
            <IoIosArrowRoundBack size={60} className="text-[#ff4d2d]" />
          </div>
          <h1 className="text-2xl font-bold text-start text-white">Your Cart</h1>
        </div>
        {cartItems?.length == 0 ? (
          <p className="text-white text-lg text-center bg-white/10 backdrop-blur-sm p-6 rounded-xl">Your Cart is Empty</p>
        ) : (<>
          <div className="space-y-4">
            {cartItems?.map((item, index) => (
              <CartItemCard data={item} key={index} />
            ))}
          </div>
          <div className="mt-6 bg-white p-4 rounded-xl shadow flex justify-between items-center border">
            <h1 className="text-lg font-semibold"> Total Amount</h1>
            <span className="text-xl font-bold text-[#ff4d2d]" >
              Rs {totalAmount}
            </span>
          </div>
          <div className="mt-4 flex justify-end" >
            <button className="bg-[#ff4d2d] text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-[#e64526] transition cursor-pointer" onClick={() => navigate("/checkout")}>
              Proceed to CheckOut
            </button>
          </div>
        </>

        )}
      </div>
    </div>
  );
}

export default CartPage;

