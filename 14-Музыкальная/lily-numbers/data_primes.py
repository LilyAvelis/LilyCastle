"""
Lily Numbers Research - Prime Generation
Генерация простых чисел, включая 1 как первое "простое" (Аксиома Лилии)
"""

def is_prime(n):
    """Проверка, является ли число простым"""
    if n <= 1:
        return False
    if n <= 3:
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False
    i = 5
    while i * i <= n:
        if n % i == 0 or n % (i + 2) == 0:
            return False
        i += 6
    return True

def generate_primes_up_to(limit):
    """Генерация простых чисел до limit, включая 1"""
    primes = [1]  # Аксиома Лилии
    num = 2
    while num <= limit:
        if is_prime(num):
            primes.append(num)
        num += 1
    return primes

def generate_n_primes(n):
    """Генерация первых n простых, включая 1"""
    primes = [1]
    num = 2
    while len(primes) < n:
        if is_prime(num):
            primes.append(num)
        num += 1
    return primes

if __name__ == "__main__":
    # Пример: первые 20 простых
    primes = generate_n_primes(20)
    print("Первые 20 простых (с 1):", primes)