def test_addition():
    assert 1 + 1 == 2

def test_string_upper():
    assert "chef".upper() == "CHEF"

def test_list_append():
    my_list = [1, 2]
    my_list.append(3)
    assert my_list == [1, 2, 3]