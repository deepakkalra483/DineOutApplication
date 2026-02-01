import android.content.Context
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableArray
import org.json.JSONArray
import org.json.JSONObject

class OrdersModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val dbHelper = DatabaseHelper(reactContext)
    private val prefs = reactContext.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)

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
            // orders is: List<Map<String, Any>>

            val jsonArray = JSONArray()

            for (userMap in orders) {
                val userObject = JSONObject()

                userObject.put("id", userMap["id"])
                userObject.put("name", userMap["name"])
                userObject.put("data", JSONArray(userMap["data"] as List<*>))

                jsonArray.put(userObject)
            }

            promise.resolve(jsonArray.toString())
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

    @ReactMethod
    fun insertRoomRent(table:String,items: String,id:String,name:String,mobile:String,promise: Promise){
        try {
            dbHelper.insertOrder(table,items,"","1",id,"rent",name,mobile)
            promise.resolve("Sucesfully updated")
        }catch (e:Exception){
            promise.reject("DB_ERROR", e.message ?: "Error updating rent")
        }
    }

    @ReactMethod
    fun insertOrderinDb(
        table: String,
        items: String,
        id: String,
        message: String,
        name: String,
        mobile: String,
        promise: Promise
    ) {
        try {
            dbHelper.insertOrder(
                tableNumber = table,
                items = items,
                token = "",     // if you don’t use token for now
                read = "1",
                userId = id,
                message = message,
                name = name,
                mobile = mobile
            )

            promise.resolve("Successfully Updated")
        } catch (e: Exception) {
            promise.reject("DB_ERROR", e.message ?: "Error updating order")
        }
    }

    @ReactMethod
    fun insertCustomer(name: String, mobile: String, promise: Promise) {
        try {
            val rowId = dbHelper.addCustomer(name, mobile)
            if (rowId != -1L) {
                promise.resolve("Customer added successfully")
            } else {
                promise.reject("DB_ERROR", "Failed to add customer")
            }
        } catch (e: Exception) {
            promise.reject("DB_ERROR", e.message ?: "Error add customer")
        }
    }

    @ReactMethod
    fun getAllCustomers(promise: Promise) {
        try {
            val customers = dbHelper.getAllCustomers() // returns List<Customer>
            val result = Arguments.createArray()

            for (customer in customers) {
                val map = Arguments.createMap()
                map.putInt("id", customer.id)
                map.putString("name", customer.name)
                map.putString("mobile", customer.mobile)
                result.pushMap(map)
            }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("DB_ERROR", e.message ?: "Error get customers rent")
        }
    }

    @ReactMethod
    fun getAllUsers(promise: Promise) {
        try {
            val customers = dbHelper.getAllUsers() // returns List<Customer>
            val result = Arguments.createArray()

            for (customer in customers) {
                val map = Arguments.createMap()
                map.putString("userId", customer["userId"])
                map.putString("name", customer["name"])
                map.putString("mobile", customer["mobile"])
                result.pushMap(map)
            }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("DB_ERROR", e.message ?: "Error get customers rent")
        }
    }

    @ReactMethod
    fun storeRooms(roomsArray: ReadableArray, promise: Promise) {
        try {
            val jsonArray = JSONArray()

            for (i in 0 until roomsArray.size()) {
                val obj = roomsArray.getMap(i)
                val jsonObject = org.json.JSONObject()

                if (obj != null) {
                    val iterator = obj.keySetIterator()
                    while (iterator.hasNextKey()) {
                        val key = iterator.nextKey()
                        val value = obj.getDynamic(key)
                        jsonObject.put(key, value?.asString() ?: "")
                    }
                }

                jsonArray.put(jsonObject)
            }

            // Save JSON string in SharedPreferences
            val prefs = reactApplicationContext.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
            prefs.edit().putString("rooms", jsonArray.toString()).apply()

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message ?: "Failed to store rooms")
        }
    }

    @ReactMethod
    fun checkOut(tableNumber: String, mobile: String, promise: Promise) {
        try {
            dbHelper.checkout(tableNumber, mobile)
            promise.resolve("Checkout successful")
        } catch (e: Exception) {
            promise.reject("CHECKOUT_ERROR", e.message)
        }
    }

    @ReactMethod
    fun updateRoomRent(id: String, newPrice: String, promise: Promise) {
        try {
            dbHelper.updateOrder(id, newPrice)
            promise.resolve("Rent updated successfully")
        } catch (e: Exception) {
            promise.reject("DB_ERROR", e.message ?: "Error updating rent")
        }
    }
}
