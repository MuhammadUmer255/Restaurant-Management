import os
import secrets
import hashlib
import smtplib
from email.message import EmailMessage
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from fastapi import FastAPI
from supabase import create_client, Client
from pydantic import BaseModel, EmailStr

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Supabase environment variables are missing.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="GourmetOS Backend")


@app.get("/")
def home():
    return {"message": "GourmetOS Backend is running!"}


@app.get("/supabase-test")
def supabase_test():
    try:
        result = supabase.auth.admin.list_users(page=1, per_page=1)

        return {
            "message": "Supabase API connection successful!",
            "users_found": len(result)
        }

    except Exception as e:
        return {
            "message": "Supabase API connection failed!",
            "error": str(e)
        }

    

class RegisterRequest(BaseModel):
    full_name: str
    restaurant_name: str | None = None
    email: EmailStr
    role: str
    designation: str | None = None
    password: str
    confirm_password: str

class ForgotPasswordRequest(BaseModel):
    email: str

@app.post("/api/v1/auth/register")
def register(request: RegisterRequest):
    try:
        if request.password != request.confirm_password:
            return {
                "message": "Passwords do not match."
            }

        if request.role not in ["admin", "user"]:
            return {
                "message": "Invalid role."
            }

        auth_response = supabase.auth.admin.create_user({
            "email": request.email,
            "password": request.password,
            "email_confirm": True
        })

        user = auth_response.user

        profile_response = supabase.table("profiles").insert({
            "id": user.id,
            "full_name": request.full_name,
            "email": request.email,
            "role": request.role,
            "designation": request.designation,
            "restaurant_name": request.restaurant_name
        }).execute()

        return {
            "message": "Registration successful!",
            "user": profile_response.data[0]
        }

    except Exception as e:
        return {
            "message": "Registration failed!",
            "error": str(e)
        }

class EmployeeCreate(BaseModel):
    full_name: str
    email: EmailStr
    role: str
    active: bool = True


class EmployeeUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    role: str | None = None
    active: bool | None = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@app.post("/api/v1/auth/login")
def login(request: LoginRequest):
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })

        user = auth_response.user
        session = auth_response.session

        profile_response = (
            supabase
            .table("profiles")
            .select("*")
            .eq("id", user.id)
            .single()
            .execute()
        )

        return {
            "message": "Login successful!",
            "user": profile_response.data,
            "access_token": session.access_token,
            "refresh_token": session.refresh_token
        }

    except Exception as e:
        return {
            "message": "Login failed!",
            "error": str(e)
        }

@app.post("/api/v1/employees")
def create_employee(request: EmployeeCreate):
    try:
        response = (
            supabase
            .table("employees")
            .insert({
                "full_name": request.full_name,
                "email": request.email,
                "role": request.role,
                "active": request.active
            })
            .execute()
        )

        return {
            "message": "Employee created successfully!",
            "employee": response.data[0]
        }

    except Exception as e:
        return {
            "message": "Employee creation failed!",
            "error": str(e)
        }
@app.get("/api/v1/employees")
def get_employees():
    try:
        response = (
            supabase
            .table("employees")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )

        return {
            "message": "Employees fetched successfully!",
            "employees": response.data
        }

    except Exception as e:
        return {
            "message": "Failed to fetch employees!",
            "error": str(e)
        }

@app.put("/api/v1/employees/{employee_id}")
def update_employee(employee_id: str, request: EmployeeUpdate):
    try:
        update_data = request.model_dump(exclude_none=True)

        response = (
            supabase
            .table("employees")
            .update(update_data)
            .eq("id", employee_id)
            .execute()
        )

        return {
            "message": "Employee updated successfully!",
            "employee": response.data[0]
        }

    except Exception as e:
        return {
            "message": "Employee update failed!",
            "error": str(e)
        }

@app.delete("/api/v1/employees/{employee_id}")
def delete_employee(employee_id: str):
    try:
        response = (
            supabase
            .table("employees")
            .delete()
            .eq("id", employee_id)
            .execute()
        )

        return {
            "message": "Employee deleted successfully!"
        }

    except Exception as e:
        return {
            "message": "Employee deletion failed!",
            "error": str(e)
        }

class MenuItemCreate(BaseModel):
    name: str
    price: float
    category: str
    available: bool = True


class MenuItemUpdate(BaseModel):
    name: str | None = None
    price: float | None = None
    category: str | None = None
    available: bool | None = None       

@app.post("/api/v1/menu-items")
def create_menu_item(request: MenuItemCreate):
    try:
        response = (
            supabase
            .table("menu_items")
            .insert({
                "name": request.name,
                "price": request.price,
                "category": request.category,
                "available": request.available
            })
            .execute()
        )

        return {
            "message": "Menu item created successfully!",
            "menu_item": response.data[0]
        }

    except Exception as e:
        return {
            "message": "Menu item creation failed!",
            "error": str(e)
        }
@app.get("/api/v1/menu-items")
def get_menu_items():
    try:
        response = (
            supabase
            .table("menu_items")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )

        return {
            "message": "Menu items fetched successfully!",
            "menu_items": response.data
        }

    except Exception as e:
        return {
            "message": "Failed to fetch menu items!",
            "error": str(e)
        }   

@app.put("/api/v1/menu-items/{menu_item_id}")
def update_menu_item(menu_item_id: str, request: MenuItemUpdate):
    try:
        update_data = request.model_dump(exclude_none=True)

        response = (
            supabase
            .table("menu_items")
            .update(update_data)
            .eq("id", menu_item_id)
            .execute()
        )

        return {
            "message": "Menu item updated successfully!",
            "menu_item": response.data[0]
        }

    except Exception as e:
        return {
            "message": "Menu item update failed!",
            "error": str(e)
        }  

@app.delete("/api/v1/menu-items/{menu_item_id}")
def delete_menu_item(menu_item_id: str):
    try:
        response = (
            supabase
            .table("menu_items")
            .delete()
            .eq("id", menu_item_id)
            .execute()
        )

        return {
            "message": "Menu item deleted successfully!"
        }

    except Exception as e:
        return {
            "message": "Menu item deletion failed!",
            "error": str(e)
        }

class TableCreate(BaseModel):
    table_number: int
    seats: int
    status: str = "Available"
    zone: str | None = None
    reserved_customer: str | None = None
    reservation_time: str | None = None


class TableUpdate(BaseModel):
    table_number: int | None = None
    seats: int | None = None
    status: str | None = None
    zone: str | None = None
    reserved_customer: str | None = None
    reservation_time: str | None = None

@app.post("/api/v1/tables")
def create_table(request: TableCreate):
    try:
        response = (
            supabase
            .table("tables")
            .insert({
                "table_number": request.table_number,
                "seats": request.seats,
                "status": request.status,
                "zone": request.zone,
                "reserved_customer": request.reserved_customer,
                "reservation_time": request.reservation_time
            })
            .execute()
        )

        return {
            "message": "Table created successfully!",
            "table": response.data[0]
        }

    except Exception as e:
        return {
            "message": "Table creation failed!",
            "error": str(e)
        }

@app.get("/api/v1/tables")
def get_tables():
    try:
        response = (
            supabase
            .table("tables")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )

        return {
            "message": "Tables fetched successfully!",
            "tables": response.data
        }

    except Exception as e:
        return {
            "message": "Failed to fetch tables!",
            "error": str(e)
        }

@app.put("/api/v1/tables/{table_id}")
def update_table(table_id: str, request: TableUpdate):
    try:
        update_data = request.model_dump(exclude_none=True)

        response = (
            supabase
            .table("tables")
            .update(update_data)
            .eq("id", table_id)
            .execute()
        )

        return {
            "message": "Table updated successfully!",
            "table": response.data[0]
        }

    except Exception as e:
        return {
            "message": "Table update failed!",
            "error": str(e)
        }


@app.delete("/api/v1/tables/{table_id}")
def delete_table(table_id: str):
    try:
        response = (
            supabase
            .table("tables")
            .delete()
            .eq("id", table_id)
            .execute()
        )

        return {
            "message": "Table deleted successfully!"
        }

    except Exception as e:
        return {
            "message": "Table deletion failed!",
            "error": str(e)
        }

class OrderCreate(BaseModel):
    order_number: str
    table_number: int
    waiter_name: str
    status: str = "Pending"
    payment_status: str = "Unpaid"
    total_amount: float = 0


class OrderUpdate(BaseModel):
    table_number: int | None = None
    waiter_name: str | None = None
    status: str | None = None
    payment_status: str | None = None
    total_amount: float | None = None


@app.post("/api/v1/orders")
def create_order(request: OrderCreate):
    try:
        response = (
            supabase
            .table("orders")
            .insert({
                "order_number": request.order_number,
                "table_number": request.table_number,
                "waiter_name": request.waiter_name,
                "status": request.status,
                "payment_status": request.payment_status,
                "total_amount": request.total_amount
            })
            .execute()
        )

        return {
            "message": "Order created successfully!",
            "order": response.data[0]
        }

    except Exception as e:
        return {
            "message": "Order creation failed!",
            "error": str(e)
        }


@app.get("/api/v1/orders")
def get_orders():
    try:
        response = (
            supabase
            .table("orders")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )

        return {
            "message": "Orders fetched successfully!",
            "orders": response.data
        }

    except Exception as e:
        return {
            "message": "Failed to fetch orders!",
            "error": str(e)
        }


@app.put("/api/v1/orders/{order_id}")
def update_order(order_id: str, request: OrderUpdate):
    try:
        update_data = request.model_dump(exclude_none=True)

        response = (
            supabase
            .table("orders")
            .update(update_data)
            .eq("id", order_id)
            .execute()
        )

        return {
            "message": "Order updated successfully!",
            "order": response.data[0]
        }

    except Exception as e:
        return {
            "message": "Order update failed!",
            "error": str(e)
        }

@app.delete("/api/v1/orders/{order_id}")
def delete_order(order_id: str):
    try:
        response = (
            supabase
            .table("orders")
            .delete()
            .eq("id", order_id)
            .execute()
        )

        return {
            "message": "Order deleted successfully!"
        }

    except Exception as e:
        return {
            "message": "Order deletion failed!",
            "error": str(e)
        }

class OrderItemCreate(BaseModel):
    order_id: str
    menu_item_id: str
    item_name: str
    quantity: int
    unit_price: float


class OrderItemUpdate(BaseModel):
    item_name: str | None = None
    quantity: int | None = None
    unit_price: float | None = None


@app.post("/api/v1/order-items")
def create_order_item(request: OrderItemCreate):
    try:
        response = (
            supabase
            .table("order_items")
            .insert({
                "order_id": request.order_id,
                "menu_item_id": request.menu_item_id,
                "item_name": request.item_name,
                "quantity": request.quantity,
                "unit_price": request.unit_price
            })
            .execute()
        )

        return {
            "message": "Order item created successfully!",
            "order_item": response.data[0]
        }

    except Exception as e:
        return {
            "message": "Order item creation failed!",
            "error": str(e)
        }


@app.get("/api/v1/order-items")
def get_order_items():
    try:
        response = (
            supabase
            .table("order_items")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )

        return {
            "message": "Order items fetched successfully!",
            "order_items": response.data
        }

    except Exception as e:
        return {
            "message": "Failed to fetch order items!",
            "error": str(e)
        }


@app.put("/api/v1/order-items/{order_item_id}")
def update_order_item(order_item_id: str, request: OrderItemUpdate):
    try:
        update_data = request.model_dump(exclude_none=True)

        response = (
            supabase
            .table("order_items")
            .update(update_data)
            .eq("id", order_item_id)
            .execute()
        )

        return {
            "message": "Order item updated successfully!",
            "order_item": response.data[0]
        }

    except Exception as e:
        return {
            "message": "Order item update failed!",
            "error": str(e)
        }


@app.delete("/api/v1/order-items/{order_item_id}")
def delete_order_item(order_item_id: str):
    try:
        response = (
            supabase
            .table("order_items")
            .delete()
            .eq("id", order_item_id)
            .execute()
        )

        return {
            "message": "Order item deleted successfully!"
        }

    except Exception as e:
        return {
            "message": "Order item deletion failed!",
            "error": str(e)
        }

class PaymentCreate(BaseModel):
    order_id: str
    subtotal: float
    discount_percent: float = 0
    discount_amount: float = 0
    tax_amount: float = 0
    grand_total: float
    payment_method: str
    cash_received: float | None = None
    change_due: float | None = None


class PaymentUpdate(BaseModel):
    subtotal: float | None = None
    discount_percent: float | None = None
    discount_amount: float | None = None
    tax_amount: float | None = None
    grand_total: float | None = None
    payment_method: str | None = None
    cash_received: float | None = None
    change_due: float | None = None


@app.post("/api/v1/payments")
def create_payment(request: PaymentCreate):
    try:
        response = (
            supabase
            .table("payments")
            .insert({
                "order_id": request.order_id,
                "subtotal": request.subtotal,
                "discount_percent": request.discount_percent,
                "discount_amount": request.discount_amount,
                "tax_amount": request.tax_amount,
                "grand_total": request.grand_total,
                "payment_method": request.payment_method,
                "cash_received": request.cash_received,
                "change_due": request.change_due
            })
            .execute()
        )

        return {
            "message": "Payment created successfully!",
            "payment": response.data[0]
        }

    except Exception as e:
        return {
            "message": "Payment creation failed!",
            "error": str(e)
        }


@app.get("/api/v1/payments")
def get_payments():
    try:
        response = (
            supabase
            .table("payments")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )

        return {
            "message": "Payments fetched successfully!",
            "payments": response.data
        }

    except Exception as e:
        return {
            "message": "Failed to fetch payments!",
            "error": str(e)
        }


@app.put("/api/v1/payments/{payment_id}")
def update_payment(payment_id: str, request: PaymentUpdate):
    try:
        update_data = request.model_dump(exclude_none=True)

        response = (
            supabase
            .table("payments")
            .update(update_data)
            .eq("id", payment_id)
            .execute()
        )

        return {
            "message": "Payment updated successfully!",
            "payment": response.data[0]
        }

    except Exception as e:
        return {
            "message": "Payment update failed!",
            "error": str(e)
        }


@app.delete("/api/v1/payments/{payment_id}")
def delete_payment(payment_id: str):
    try:
        response = (
            supabase
            .table("payments")
            .delete()
            .eq("id", payment_id)
            .execute()
        )

        return {
            "message": "Payment deleted successfully!"
        }

    except Exception as e:
        return {
            "message": "Payment deletion failed!",
            "error": str(e)
        }


@app.get("/api/v1/dashboard")
def dashboard():
    try:
        employees = supabase.table("employees").select("id", count="exact").execute()
        menu_items = supabase.table("menu_items").select("id", count="exact").execute()
        tables = supabase.table("tables").select("id", count="exact").execute()
        orders = supabase.table("orders").select("id", count="exact").execute()
        payments = supabase.table("payments").select("grand_total").execute()

        total_revenue = sum(
            float(payment["grand_total"] or 0)
            for payment in payments.data
        )

        return {
            "message": "Dashboard data fetched successfully!",
            "statistics": {
                "total_employees": employees.count or 0,
                "total_menu_items": menu_items.count or 0,
                "total_tables": tables.count or 0,
                "total_orders": orders.count or 0,
                "total_revenue": total_revenue
            }
        }

    except Exception as e:
        return {
            "message": "Failed to fetch dashboard data!",
            "error": str(e)
        }

@app.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest):
    try:
        email = request.email.strip().lower()

        # Check whether the email belongs to a registered user
        users = supabase.auth.admin.list_users(page=1, per_page=1000)

        user_exists = any(
            user.email and user.email.lower() == email
            for user in users
        )

        # Don't reveal whether an email exists
        if not user_exists:
            return {
                "message": "If this email is registered, an OTP has been sent."
            }

        # Generate 6-digit OTP
        otp = f"{secrets.randbelow(1000000):06d}"

        # Hash OTP before storing it
        otp_hash = hashlib.sha256(otp.encode()).hexdigest()

        # OTP expires in 10 minutes
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

        # Invalidate previous unused OTPs for this email
        supabase.table("password_reset_otps").update({
            "used": True
        }).eq("email", email).eq("used", False).execute()

        # Store new OTP hash
        supabase.table("password_reset_otps").insert({
            "email": email,
            "otp_hash": otp_hash,
            "expires_at": expires_at.isoformat(),
            "attempts": 0,
            "used": False
        }).execute()

        # Create email
        msg = EmailMessage()
        msg["Subject"] = "GourmetOS Password Reset OTP"
        msg["From"] = os.getenv("SMTP_USERNAME")
        msg["To"] = email

        msg.set_content(
            f"""Hello,

Your GourmetOS password reset OTP is:

{otp}

This OTP will expire in 10 minutes.

If you did not request a password reset, you can safely ignore this email.

GourmetOS
"""
        )

        # Send through Gmail SMTP
        with smtplib.SMTP(os.getenv("SMTP_HOST"), int(os.getenv("SMTP_PORT", "587"))) as server:
            server.starttls()
            server.login(
                os.getenv("SMTP_USERNAME"),
                os.getenv("SMTP_PASSWORD")
            )
            server.send_message(msg)

        return {
            "message": "If this email is registered, an OTP has been sent."
        }

    except Exception as e:
        return {
            "message": "Password reset request failed!",
            "error": str(e)
        }
class VerifyOTPRequest(BaseModel):
    email: str
    otp: str


@app.post("/verify-otp")
def verify_otp(request: VerifyOTPRequest):
    try:
        email = request.email.strip().lower()
        otp = request.otp.strip()

        # Get latest unused OTP
        result = (
            supabase.table("password_reset_otps")
            .select("*")
            .eq("email", email)
            .eq("used", False)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

        if not result.data:
            return {
                "message": "Invalid or expired OTP."
            }

        otp_record = result.data[0]

        # Check attempts
        if otp_record.get("attempts", 0) >= 5:
            return {
                "message": "Too many OTP attempts. Please request a new OTP."
            }

        # Check expiry
        expires_at = datetime.fromisoformat(
            otp_record["expires_at"].replace("Z", "+00:00")
        )

        if datetime.now(timezone.utc) > expires_at:
            return {
                "message": "OTP has expired. Please request a new OTP."
            }

        # Hash entered OTP
        entered_hash = hashlib.sha256(otp.encode()).hexdigest()

        # Check OTP
        if entered_hash != otp_record["otp_hash"]:
            supabase.table("password_reset_otps").update({
                "attempts": otp_record.get("attempts", 0) + 1
            }).eq("id", otp_record["id"]).execute()

            return {
                "message": "Invalid OTP."
            }

        return {
            "message": "OTP verified successfully!"
        }

    except Exception as e:
        return {
            "message": "OTP verification failed!",
            "error": str(e)
        }

class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str
    confirm_password: str


@app.post("/reset-password")
def reset_password(request: ResetPasswordRequest):
    try:
        email = request.email.strip().lower()
        otp = request.otp.strip()

        if request.new_password != request.confirm_password:
            return {
                "message": "Passwords do not match."
            }

        if len(request.new_password) < 6:
            return {
                "message": "Password must be at least 6 characters long."
            }

        # Get latest unused OTP
        result = (
            supabase.table("password_reset_otps")
            .select("*")
            .eq("email", email)
            .eq("used", False)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

        if not result.data:
            return {
                "message": "Invalid or expired OTP."
            }

        otp_record = result.data[0]

        # Check expiry
        expires_at = datetime.fromisoformat(
            otp_record["expires_at"].replace("Z", "+00:00")
        )

        if datetime.now(timezone.utc) > expires_at:
            return {
                "message": "OTP has expired. Please request a new OTP."
            }

        # Verify OTP
        entered_hash = hashlib.sha256(otp.encode()).hexdigest()

        if entered_hash != otp_record["otp_hash"]:
            return {
                "message": "Invalid OTP."
            }

        # Find user
        users = supabase.auth.admin.list_users(page=1, per_page=1000)

        user = next(
            (
                user for user in users
                if user.email and user.email.lower() == email
            ),
            None
        )

        if not user:
            return {
                "message": "User not found."
            }

        # Update Supabase password
        supabase.auth.admin.update_user_by_id(
            user.id,
            {
                "password": request.new_password
            }
        )

        # Mark OTP as used
        supabase.table("password_reset_otps").update({
            "used": True
        }).eq("id", otp_record["id"]).execute()

        return {
            "message": "Password reset successfully!"
        }

    except Exception as e:
        return {
            "message": "Password reset failed!",
            "error": str(e)
        }