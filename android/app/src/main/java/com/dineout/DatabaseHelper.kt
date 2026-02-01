import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import org.json.JSONArray
import org.json.JSONObject

class DatabaseHelper(context: Context) : SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {
    companion object {
        private const val DATABASE_NAME = "orders.db"
        private const val DATABASE_VERSION = 12
        private const val LATEST_ORDER="latest_order"
        const val TABLE_NAME = "orders"
        const val COLUMN_ID = "id"
        const val COLUMN_TABLE_NUMBER = "table_number"
        const val COLUMN_ITEMS = "items"
        const val COLUMN_TIMESTAMP = "time_stamp"
        const val COLUMN_STATUS="read"
        const val COLUMN_TOKEN="token"
        const val COLUMN_USER_ID="user_id"
        const val COLUMN_MESSAGE="message"
        const val COLUMN_NAME="name"
        const val COLUMN_MOBILE="mobile"

        private const val TABLE_CATEGORY = "category"
        private const val COLUMN_CATEGORY_ID = "category_id"
        private const val COLUMN_CATEGORY_NAME = "category_name"

        private const val TABLE_ITEM = "items"
        private const val COLUMN_ITEM_ID = "id"
        private const val COLUMN_ITEM_NAME = "name"
        private const val COLUMN_ITEM_PRICE = "price"
        private const val COLUMN_ITEM_IMAGE = "src"
        private const val COLUMN_ITEM_CATEGORY_ID = "category_id" // Foreign key

        private const val CUSTOMER_TABLE = "customers"
        private const val CUSTOMER_ID = "id"
        private const val CUSTOMER_NAME = "name"
        private const val CUSTOMER_MOBILE = "mobile"

        data class Customer(
            val id: Int = 0,
            val name: String,
            val mobile: String
        )
    }

    override fun onCreate(db: SQLiteDatabase) {
        val createTableQuery = "CREATE TABLE $TABLE_NAME ($COLUMN_ID INTEGER PRIMARY KEY AUTOINCREMENT, $COLUMN_TABLE_NUMBER TEXT, $COLUMN_ITEMS TEXT, $COLUMN_TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "$COLUMN_STATUS INTEGER ,$COLUMN_TOKEN TEXT, $COLUMN_USER_ID TEXT, $COLUMN_MESSAGE TEXT, $COLUMN_NAME TEXT, $COLUMN_MOBILE TEXT)"

        val createLatestTable = "CREATE TABLE $LATEST_ORDER ($COLUMN_ID INTEGER PRIMARY KEY AUTOINCREMENT, $COLUMN_TABLE_NUMBER TEXT, $COLUMN_ITEMS TEXT, $COLUMN_TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "$COLUMN_STATUS INTEGER ,$COLUMN_TOKEN TEXT, $COLUMN_USER_ID TEXT, $COLUMN_MESSAGE TEXT, $COLUMN_NAME TEXT, $COLUMN_MOBILE TEXT)"

        val createCategoryTable = "CREATE TABLE $TABLE_CATEGORY ($COLUMN_CATEGORY_ID INTEGER PRIMARY KEY AUTOINCREMENT, $COLUMN_CATEGORY_NAME TEXT UNIQUE)"
        val createItemTable = "CREATE TABLE $TABLE_ITEM ($COLUMN_ITEM_ID INTEGER PRIMARY KEY AUTOINCREMENT, $COLUMN_ITEM_NAME TEXT, $COLUMN_ITEM_PRICE TEXT, $COLUMN_ITEM_IMAGE TEXT, $COLUMN_ITEM_CATEGORY_ID INTEGER, FOREIGN KEY ($COLUMN_ITEM_CATEGORY_ID) REFERENCES $TABLE_CATEGORY($COLUMN_CATEGORY_ID))"

        val createCustomerTable = """
            CREATE TABLE $CUSTOMER_TABLE (
                $CUSTOMER_ID INTEGER PRIMARY KEY AUTOINCREMENT,
                $CUSTOMER_NAME TEXT,
                $CUSTOMER_MOBILE TEXT
            )
        """.trimIndent()
        db.execSQL(createTableQuery)
        db.execSQL(createLatestTable)
        db.execSQL(createCategoryTable)
        db.execSQL(createItemTable)
        db.execSQL(createCustomerTable)
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        val tables = arrayOf("customers", "orders", "items","category")
        for (table in tables) {
            db.execSQL("DROP TABLE IF EXISTS $table")
        }
        onCreate(db)
    }

    fun insertItem(name: String, price: String, image: String, categoryId: Int): Long {
        val db = this.writableDatabase
        val values = ContentValues().apply {
            put(COLUMN_ITEM_NAME, name)
            put(COLUMN_ITEM_PRICE, price)
            put(COLUMN_ITEM_IMAGE, image)
            put(COLUMN_ITEM_CATEGORY_ID, categoryId)
        }
        val id = db.insert(TABLE_ITEM, null, values)
        db.close()
        return id
    }

    fun updateItem(itemId: Int, name: String, price: String, image: String, categoryId: Int): Int {
        val db = this.writableDatabase
        val values = ContentValues().apply {
            put(COLUMN_ITEM_NAME, name)
            put(COLUMN_ITEM_PRICE, price)
            put(COLUMN_ITEM_IMAGE, image)
            put(COLUMN_ITEM_CATEGORY_ID, categoryId)
        }

        val rowsAffected = db.update(
            TABLE_ITEM,
            values,
            "$COLUMN_ITEM_ID = ?",
            arrayOf(itemId.toString())
        )

        db.close()
        return rowsAffected
    }

    fun insertCategory(name: String): Long {
        val db = writableDatabase
        val values = ContentValues().apply {
            put(COLUMN_CATEGORY_NAME, name)
        }
        val id = db.insert(TABLE_CATEGORY, null, values)
//        db.close()
        return id
    }

    fun getCategories(): List<Map<String, Any>> {
        val db = readableDatabase
        val cursor = db.rawQuery("SELECT * FROM $TABLE_CATEGORY", null)
        val categories = mutableListOf<Map<String, Any>>()

        if (cursor.moveToFirst()) {
            do {
                val category = mapOf(
                    "category_id" to cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_CATEGORY_ID)),
                    "category_name" to cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_CATEGORY_NAME))
                )
                categories.add(category)
            } while (cursor.moveToNext())
        }
        cursor.close()
        db.close()
        return categories
    }

    fun checkout(tableNumber: String,mobile:String){
        val db = writableDatabase
        val deleteQuery = "DELETE FROM $LATEST_ORDER WHERE $COLUMN_TABLE_NUMBER = ? AND $COLUMN_MOBILE != ?"
        db.execSQL(deleteQuery, arrayOf(tableNumber, mobile))
    }

    fun insertOrder(tableNumber: String, items: String,token:String,read:String,userId:String,message:String,name:String,mobile:String) {
        val db = writableDatabase
        val values = ContentValues().apply {
            put(COLUMN_TABLE_NUMBER, tableNumber)
            put(COLUMN_ITEMS, items)
            put(COLUMN_STATUS,read)
            put(COLUMN_TOKEN,token)
            put(COLUMN_USER_ID,userId)
            put(COLUMN_MESSAGE,message)
            put(COLUMN_NAME,name )
            put(COLUMN_MOBILE,mobile)
        }
        db.insert(TABLE_NAME, null, values)
        val deleteQuery = "DELETE FROM $LATEST_ORDER WHERE $COLUMN_TABLE_NUMBER = ? AND $COLUMN_MOBILE != ?"
        db.execSQL(deleteQuery, arrayOf(tableNumber, mobile))

        // Insert into Latest Orders (Always keeps track of the latest orders)
        val latestValues = ContentValues().apply {
            put(COLUMN_TABLE_NUMBER, tableNumber)
            put(COLUMN_ITEMS, items)
            put(COLUMN_STATUS,read)
            put(COLUMN_TOKEN,token)
            put(COLUMN_USER_ID,userId)
            put(COLUMN_MESSAGE,message)
            put(COLUMN_NAME,name)
            put(COLUMN_MOBILE,mobile)
        }
        db.insert(LATEST_ORDER, null, latestValues)
        db.close()
    }

    fun getMenuItems(): List<Map<String, Any>> {
        val db = readableDatabase
        val menuMap = mutableMapOf<Pair<String, Int>, MutableList<Map<String, Any>>>()

        val cursor = db.rawQuery(
            "SELECT c.$COLUMN_CATEGORY_ID, c.$COLUMN_CATEGORY_NAME, i.$COLUMN_ITEM_ID, i.$COLUMN_ITEM_NAME, i.$COLUMN_ITEM_PRICE, i.$COLUMN_ITEM_IMAGE " +
                    "FROM $TABLE_ITEM i " +
                    "JOIN $TABLE_CATEGORY c ON i.$COLUMN_ITEM_CATEGORY_ID = c.$COLUMN_CATEGORY_ID " +
                    "ORDER BY c.$COLUMN_CATEGORY_NAME ASC", null
        )

        while (cursor.moveToNext()) {
            val categoryName = cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_CATEGORY_NAME))
            val categoryId = cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_CATEGORY_ID))
            val priceObject = cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ITEM_PRICE))

            // Convert price string to JSONObject safely
            val price = try {
                JSONObject(priceObject)
            } catch (e: Exception) {
                JSONObject() // Return an empty JSONObject if parsing fails
            }

            val item = mapOf(
                COLUMN_ITEM_ID to cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_ITEM_ID)),
                COLUMN_ITEM_NAME to cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ITEM_NAME)),
                COLUMN_ITEM_PRICE to price,
                COLUMN_ITEM_IMAGE to cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ITEM_IMAGE))
            )

            val categoryKey = categoryName to categoryId // Pair of categoryName & categoryId

            if (!menuMap.containsKey(categoryKey)) {
                menuMap[categoryKey] = mutableListOf()
            }
            menuMap[categoryKey]?.add(item)
        }

        cursor.close()
        db.close()

        return menuMap.map { (categoryPair, items) ->
            mapOf(
                "categoryId" to categoryPair.second,
                "category" to categoryPair.first,
                "items" to items
            )
        }
    }


    data class TableOrders(
        val token: String,
        val name: String,
        val mobile: String,
        val orders: MutableList<Map<String, Any>>
    )

    fun getAllOrders(): List<Map<String, Any>> {
        val db = readableDatabase
        val ordersMap = mutableMapOf<String, TableOrders>()
        val cursor = db.rawQuery("SELECT * FROM $LATEST_ORDER ORDER BY $COLUMN_STATUS ASC, $COLUMN_TIMESTAMP DESC", null)

        while (cursor.moveToNext()) {
            val tableNumber = cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_TABLE_NUMBER))
            val token = cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_TOKEN)) ?: ""
            val itemsString = cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ITEMS))
            val itemsArray = JSONArray(itemsString)
            val name = cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_NAME)) ?: ""
            val mobile = cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_MOBILE)) ?: ""

            val order = mapOf(
                COLUMN_ID to cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_ID)),
                COLUMN_ITEMS to itemsArray,
                COLUMN_STATUS to cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_STATUS)),
                COLUMN_TIMESTAMP to cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_TIMESTAMP)),
                COLUMN_USER_ID to cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_USER_ID)),
                COLUMN_MESSAGE to cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_MESSAGE))
            )

            if (!ordersMap.containsKey(tableNumber)) {
                ordersMap[tableNumber] = TableOrders(token, name, mobile, mutableListOf(order))
            } else {
                val existing = ordersMap[tableNumber]!!
                val updatedToken = if (existing.token.isEmpty() && token.isNotEmpty()) token else existing.token
                val updatedName = if (existing.name.isEmpty() && name.isNotEmpty()) name else existing.name
                val updatedMobile = if (existing.mobile.isEmpty() && mobile.isNotEmpty()) mobile else existing.mobile
                existing.orders.add(order)
                ordersMap[tableNumber] = TableOrders(updatedToken, updatedName, updatedMobile, existing.orders)
            }
        }

        cursor.close()
        db.close()

        return ordersMap.map { (table, data) ->
            mapOf(
                "table" to table,
                "token" to data.token,
                "name" to data.name,
                "mobile" to data.mobile,
                "data" to data.orders
            )
        }
    }


    fun getOrdersByTable(tableNumber: String): List<Map<String, Any>> {
        val db = readableDatabase
        val tempMap = mutableMapOf<String, MutableMap<String, Any>>()

        val cursor = db.rawQuery(
            "SELECT * FROM $TABLE_NAME WHERE $COLUMN_TABLE_NUMBER = ? ORDER BY $COLUMN_TIMESTAMP DESC",
            arrayOf(tableNumber)
        )

        while (cursor.moveToNext()) {
            val userId = cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_USER_ID))
            val name = cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_NAME))
            val itemsString = cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ITEMS))
            val itemsArray = JSONArray(itemsString)

            val order = mapOf(
                "id" to cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_ID)),
                "items" to itemsArray,
                "read" to cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_STATUS)),
                "time_stamp" to cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_TIMESTAMP)),
                "message" to cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_MESSAGE))
            )

            if (!tempMap.containsKey(userId)) {
                tempMap[userId] = mutableMapOf(
                    "id" to userId,
                    "name" to name,
                    "data" to mutableListOf(order)
                )
            } else {
                (tempMap[userId]?.get("data") as MutableList<Map<String, Any>>).add(order)
            }
        }

        cursor.close()
        db.close()

        // ✅ THIS LINE FIXES YOUR ERROR
        return tempMap.values.toList()
    }



    fun markOrdersAsRead(tableNumber: String) {
        val db = readableDatabase
        val sql = "UPDATE $LATEST_ORDER SET $COLUMN_STATUS = 1 WHERE $COLUMN_TABLE_NUMBER = ?"
        db.execSQL(sql, arrayOf(tableNumber))
    }

    fun addCustomer(name: String, mobile: String): Long {
        val db = writableDatabase
        val values = ContentValues().apply {
            put(CUSTOMER_NAME, name)
            put(CUSTOMER_MOBILE, mobile)
        }

        val result = db.insert(CUSTOMER_TABLE, null, values)
        db.close()
        return result // returns inserted row ID, or -1 if failed
    }

    fun getAllCustomers(): List<Customer> {
        val customers = mutableListOf<Customer>()
        val db = readableDatabase
        val cursor = db.rawQuery("SELECT * FROM $CUSTOMER_TABLE", null)

        if (cursor.moveToFirst()) {
            do {
                val id = cursor.getInt(cursor.getColumnIndexOrThrow(CUSTOMER_ID))
                val name = cursor.getString(cursor.getColumnIndexOrThrow(CUSTOMER_NAME))
                val mobile = cursor.getString(cursor.getColumnIndexOrThrow(CUSTOMER_MOBILE))
                customers.add(Customer(id, name, mobile))
            } while (cursor.moveToNext())
        }

        cursor.close()
        db.close()
        return customers
    }

    fun getAllUsers(): List<Map<String, String>> {
        val db = readableDatabase
        val list = mutableListOf<Map<String, String>>()

        val query = """
    SELECT $COLUMN_USER_ID, $COLUMN_NAME, $COLUMN_MOBILE
    FROM $TABLE_NAME
    GROUP BY $COLUMN_MOBILE
    ORDER BY $COLUMN_NAME ASC
    """

        val cursor = db.rawQuery(query, null)

        if (cursor.moveToFirst()) {
            do {
                val userId = cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_USER_ID))
                val name = cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_NAME))
                val mobile = cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_MOBILE))

                list.add(
                    mapOf(
                        "userId" to userId,
                        "name" to name,
                        "mobile" to mobile
                    )
                )
            } while (cursor.moveToNext())
        }

        cursor.close()
        db.close()

        return list
    }

    fun updateOrder(id: String, newPrice: String) {
        val db = writableDatabase

        val values = ContentValues().apply {
            put(COLUMN_ITEMS, newPrice)   // Update price
        }

        db.update(
            TABLE_NAME,
            values,
            "$COLUMN_ID = ?",       // WHERE condition
            arrayOf(id)
        )

        // Also update the latest order table
        db.update(
            LATEST_ORDER,
            values,
            "$COLUMN_ID = ?",
            arrayOf(id)
        )

        db.close()
    }

}