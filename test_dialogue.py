from dialogue import generate_response

message = input("Enter a message: ")

answer = generate_response(message)

print("\nSignConnect AI Response:")
print(answer)