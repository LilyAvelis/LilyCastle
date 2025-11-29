def test_addition():
    assert 1 + 1 == 2, "Basic addition should work"

def test_string_concat():
    result = "Chef" + "s Kiss"
    assert result == "Chefs Kiss", f"Expected 'Chefs Kiss', got {result}"

if __name__ == "__main__":
    test_addition()
    test_string_concat()
    print("All tests passed!")