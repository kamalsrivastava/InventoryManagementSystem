def test_create_and_get_product(client):
    resp = client.post(
        "/products",
        json={"name": "Keyboard", "sku": "KB-1", "price": 49.99, "quantity": 30},
    )
    assert resp.status_code == 201
    pid = resp.json()["id"]

    got = client.get(f"/products/{pid}")
    assert got.status_code == 200
    assert got.json()["sku"] == "KB-1"


def test_duplicate_sku_rejected(client, product):
    resp = client.post(
        "/products",
        json={"name": "Dup", "sku": product["sku"], "price": 1, "quantity": 1},
    )
    assert resp.status_code == 409


def test_negative_quantity_rejected(client):
    resp = client.post(
        "/products",
        json={"name": "Bad", "sku": "BAD-1", "price": 1, "quantity": -5},
    )
    assert resp.status_code == 422


def test_update_product(client, product):
    resp = client.put(f"/products/{product['id']}", json={"quantity": 99})
    assert resp.status_code == 200
    assert resp.json()["quantity"] == 99


def test_delete_product(client, product):
    assert client.delete(f"/products/{product['id']}").status_code == 204
    assert client.get(f"/products/{product['id']}").status_code == 404


def test_get_missing_product_404(client):
    assert client.get("/products/9999").status_code == 404
