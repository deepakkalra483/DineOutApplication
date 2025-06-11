import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import org.json.JSONArray
import org.json.JSONObject

class OrdersModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val dbHelper = DatabaseHelper(reactContext)

    override fun getName(): String {
        return "OrdersModule"
    }

    @ReactMethod
    fun getOrders(promise: Promise) {
        try {
            val orders = dbHelper.getAllOrders()
            val jsonArray = JSONArray(orders)
            promise.resolve(jsonArray.toString())
        } catch (e: Exception) {
            promise.reject("DB_ERROR", "Error fetching orders", e)
        }
    }

    @ReactMethod
    fun getOrdersByTable(tableNumber: String, promise: Promise) {
        try {
            val orders = dbHelper.getOrdersByTable(tableNumber)

            val jsonArray = JSONArray()
            for ((userId, orderList) in orders) {
                val userObject = JSONObject()
                userObject.put("id", userId)  // Use "id" for the user
                userObject.put("data", JSONArray(orderList)) // Store orders in "data"

                jsonArray.put(userObject) // Add to array
            }

            promise.resolve(jsonArray.toString()) // Return an array instead of an object
        } catch (e: Exception) {
            promise.reject("DB_ERROR", "Error fetching orders", e)
        }
    }

    @ReactMethod
    fun markRead(tableNumber:String,promise: Promise){
        try {
            dbHelper.markOrdersAsRead(tableNumber)
            promise.resolve("Sucesfully updated")
        }catch (e:Exception){
            promise.reject("Db_Error","error update read",e)
        }
    }

    @ReactMethod
    fun insertCategoryItem(name:String,promise: Promise){
        try {
           val id= dbHelper.insertCategory(name)
            promise.resolve(id.toDouble())
        }catch (e:Exception){
            promise.reject("Db_Error","error update read",e)
        }
    }

    @ReactMethod
    fun insertMenuItem(name:String,price:String,image:String,category_id:Int, promise: Promise){
        try {
            dbHelper.insertItem(name,price,image,category_id)
            promise.resolve("Sucesfully updated")
        }catch (e:Exception){
            promise.reject("Db_Error","error update read",e)
        }
    }

    @ReactMethod
    fun updateMenuItem(itemId:Int, name:String,price:String,image:String,category_id:Int, promise: Promise){
        try {
            dbHelper.updateItem(itemId,name,price,image,category_id)
            promise.resolve("Sucesfully updated")
        }catch (e:Exception){
            promise.reject("Db_Error","error update read",e)
        }
    }

    @ReactMethod
    fun getMenu(promise: Promise) {
        try {
            val orders = dbHelper.getMenuItems()
            val jsonArray = JSONArray(orders)
            promise.resolve(jsonArray.toString())
        } catch (e: Exception) {
            promise.reject("DB_ERROR", "Error fetching orders", e)
        }
    }

    @ReactMethod
    fun getCategory(promise: Promise) {
        try {
            val orders = dbHelper.getCategories()
            val jsonArray = JSONArray(orders)
            promise.resolve(jsonArray.toString())
        } catch (e: Exception) {
            promise.reject("DB_ERROR", "Error fetching orders", e)
        }
    }
}
