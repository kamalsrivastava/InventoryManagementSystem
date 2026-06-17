def test_create_order_reduces_stock_and_computes_total(client, product, customer):
    resp = client.post(
        "/orders",
        json={"customer_id": customer["id"], "items": [{"product_id": product["id"], "quantity": 3}]},
    )
    assert resp.status_code == 201
    body = resp.json()
    # 3 units @ 20.00 = 60.00, computed server-side.
    assert float(body["total_amount"]) == 60.0
    assert body["customer_name"] == customer["full_name"]
    assert body["items"][0]["product_name"] == product["name"]

    # Stock reduced 5 -> 2.
    assert client.get(f"/products/{product['id']}").json()["quantity"] == 2


def test_insufficient_stock_rejected(client, product, customer):
    resp = client.post(
        "/orders",
        json={"customer_id": customer["id"], "items": [{"product_id": product["id"], "quantity": 99}]},
    )
    assert resp.status_code == 409


def test_order_for_missing_customer_404(client, product):
    resp = client.post(
        "/orders",
        json={"customer_id": 9999, "items": [{"product_id": product["id"], "quantity": 1}]},
    )
    assert resp.status_code == 404


def test_order_with_missing_product_404(client, customer):
    resp = client.post(
        "/orders",
        json={"customer_id": customer["id"], "items": [{"product_id": 9999, "quantity": 1}]},
    )
    assert resp.status_code == 404


def test_cancel_order_restocks(client, product, customer):
    order = client.post(
        "/orders",
        json={"customer_id": customer["id"], "items": [{"product_id": product["id"], "quantity": 3}]},
    ).json()
    assert client.get(f"/products/{product['id']}").json()["quantity"] == 2

    assert client.delete(f"/orders/{order['id']}").status_code == 204
    # Stock restored 2 -> 5.
    assert client.get(f"/products/{product['id']}").json()["quantity"] == 5


def test_empty_items_rejected(client, customer):
    resp = client.post("/orders", json={"customer_id": customer["id"], "items": []})
    assert resp.status_code == 422
