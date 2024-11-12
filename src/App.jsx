import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form, Button, Table, InputGroup } from 'react-bootstrap';
import * as htmlToImage from 'html-to-image';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function MoneySplitApp() {
	const [amount, setAmount] = useState('');
	const [totalMembers, setTotalMembers] = useState('');
	const [splitAmount, setSplitAmount] = useState('');
	const [titleText, setTitleText] = useState('');
	const [isUnequalSplit, setIsUnequalSplit] = useState(false);
	const [people, setPeople] = useState([]);
	const [grandTotal, setGrandTotal] = useState(0);
	const [errors, setErrors] = useState({ amount: '', totalMembers: '' });
	const [includeGroupMembers, setIncludeGroupMembers] = useState(true);
	const groupMembers = ['Rishi', 'Ajit', 'Divya', 'Sumeet', 'Lakhvinder'];

	const reset = () =>  {
		setIsUnequalSplit('');
		setSplitAmount('');
		setPeople([]);
	}

	function upateAmount_orMember(type,value){
		// Reset or Hide the Table. on Member Change

		reset();
		if (type === "amount") {
			setAmount(value);
		}else if (type === "member") {
			setTotalMembers(value);
		}
	}

	const predefinedNames = ["John", "Jane", "Alice", "Bob", "Charlie", "David", "Eva", "Frank", "Grace", "Hannah"];

	function downloadImg() {
		htmlToImage.toJpeg(document.getElementById('downloadImg'), { quality: 0.95 })
			.then(function (dataUrl) {
				var link = document.createElement('a');
				link.download = (titleText.trim() != '') ? titleText : "Bill Split";
				link.href = dataUrl;
				link.click();
			});
	}

	const splitRemainderEqually = () => {
    const updatedPeople = [...people]; // Assuming people is a state variable or accessible array
    const remainder = amount - grandTotal;
    
    if (remainder > 0 && updatedPeople.length > 0) {
        const remainderPerPerson = remainder / updatedPeople.length;
        let totalAdjusted = 0; // Total amount adjusted to handle rounding
        
        updatedPeople.forEach((person, index) => {
            let additionalAmount = remainderPerPerson;
            
            // Round additionalAmount to two decimal places
            additionalAmount = Number(additionalAmount.toFixed(2));
            
            // Add remainderPerPerson to each person's amountToPay
            if (index === updatedPeople.length - 1) {
                // Adjust the last person to ensure the total matches the remainder
                additionalAmount = remainder - totalAdjusted;
            }
            
            // Round to two decimal places and update amountToPay
            person.amountToPay = (parseFloat(person.amountToPay) + additionalAmount).toFixed(2);
            
            // Update totalAdjusted with the rounded additionalAmount
            totalAdjusted += additionalAmount;
        });
    }
    
    setPeople(updatedPeople); // Assuming setPeople updates the state with updatedPeople
    updateGrandTotal(updatedPeople); // Assuming updateGrandTotal updates the grandTotal based on updatedPeople
};





	function split() {
		const amountValue = parseFloat(amount);
		const totalMembersValue = parseInt(totalMembers, 10);
		let valid = true;

		if (isNaN(amountValue) || amountValue <= 0) {
			setErrors((prevErrors) => ({ ...prevErrors, amount: 'Please enter a valid amount' }));
			valid = false;
		} else {
			setErrors((prevErrors) => ({ ...prevErrors, amount: '' }));
		}

		if (isNaN(totalMembersValue) || totalMembersValue <= 0) {
			setErrors((prevErrors) => ({ ...prevErrors, totalMembers: 'Please enter a valid number of members' }));
			valid = false;
		} else {
			setErrors((prevErrors) => ({ ...prevErrors, totalMembers: '' }));
		}

		if (valid) {
			const baseAmountPerPerson = Math.floor((amountValue / totalMembersValue) * 100) / 100;
			const remainder = amountValue - baseAmountPerPerson * totalMembersValue;
			const amountPerPerson = baseAmountPerPerson.toFixed(2);

			setSplitAmount(amountPerPerson);


			const initialPeople = Array.from({ length: totalMembersValue }, (_, index) => ({
				name: (includeGroupMembers && index < groupMembers.length) ? groupMembers[index] : `Person ${index + 1}`,
				amountToPay: baseAmountPerPerson,
			}));

			if (remainder !== 0) {
				setIsUnequalSplit(true);
				for (let i = 0; i < remainder * 100; i++) {
					initialPeople[i].amountToPay += 0.01;
				}
			} else {
				setIsUnequalSplit(false);
			}

			initialPeople.forEach((person) => {
				person.amountToPay = person.amountToPay.toFixed(2);
			});

			setPeople(initialPeople);
			updateGrandTotal(initialPeople);
		} else {
			setSplitAmount('');
			setPeople([]);
			setGrandTotal(0);
		}
	}

	const handlePersonChange = (index, key, value) => {
		const updatedPeople = [...people];

		if (index === 'amountToPay') {
			value = (value === '') ? 0 : value;
		}
		
		updatedPeople[index][key] = (value === '') ? 0 : value;

		setPeople(updatedPeople);
		updateGrandTotal(updatedPeople);
	};

	const updateGrandTotal = (updatedPeople) => {
		let newGrandTotal = 0;

		updatedPeople.forEach((person) => {
			newGrandTotal += parseFloat(person.amountToPay) || 0;
		});

		setGrandTotal(newGrandTotal.toFixed(2));
	};

	return (
		<Container className="mt-5">
			<h2 className="mb-4 text-center">Bill Split App</h2>
			<Row className="mb-3">
			<Col xs={12} md={6} lg={3} className='mb-2'>
				<InputGroup>
					<InputGroup.Text>
						<i className="bi bi-vector-pen"></i>
					</InputGroup.Text>
					<Form.Control
						type="text"
						value={titleText}
						onChange={(e) => setTitleText(e.target.value)}
						placeholder="[ Optional Title Text ]"
					/>
				</InputGroup>
			</Col>
			<Col xs={12} md={6} lg={3} className="mb-2">
				<InputGroup>
					<InputGroup.Text>
						$
					</InputGroup.Text>
					<Form.Control
						type="number"
						value={amount}
						isInvalid={!!errors.amount}
						onChange={(e) => upateAmount_orMember("amount", e.target.value)}
						placeholder="Total Amount"
					/>
					<Form.Control.Feedback type="invalid">
						{errors.amount}
					</Form.Control.Feedback>
				</InputGroup>
			</Col>
			<Col xs={12} md={6} lg={3} className="mb-2">
				<InputGroup>
					<InputGroup.Text>
						<i className="bi bi-people-fill"></i>
					</InputGroup.Text>
					<Form.Control
						type="number"
						value={totalMembers}
						isInvalid={!!errors.totalMembers}
						onChange={(e) => upateAmount_orMember("member", e.target.value)}
						placeholder="Total Members"
					/>
					<Form.Control.Feedback type="invalid">
						{errors.totalMembers}
					</Form.Control.Feedback>
				</InputGroup>
			</Col>
			<Col xs={12} md={6} lg={3}>
				<Button className="w-100" onClick={split}>
					Split
				</Button>
			</Col>
		</Row>
			<Form.Check
				type="switch"
				id="custom-switch"
				checked={includeGroupMembers}
				onChange={() => setIncludeGroupMembers(!includeGroupMembers)}
				label="Include Group Members"
			/>

			{splitAmount !== '' && <p className="text-center">Each person owes <b>${splitAmount}</b>
				{isUnequalSplit && " or slightly more to cover the total."}  </p>}

			{
				splitAmount
				&&
				<>

					<Table id='downloadImg' responsive="sm">
						<thead>
							<tr>
								<th>Person Name</th>
								<th>Amount to Pay</th>
								{/* <th>Notes</th> */}
							</tr>
						</thead>
						<tbody>
							{people.map((person, index) => (
								<tr key={index}>
									<td>
										<Form.Control
											type="text"
											value={person.name}
											list="predefined-names"
											onChange={(e) => handlePersonChange(index, 'name', e.target.value)}
										/>
									</td>
									<td>
										<Form.Control
											type="number"
											value={person.amountToPay}
											onChange={(e) => handlePersonChange(index, 'amountToPay', e.target.value)}
										/>
									</td>
									{/* <td>
										<Form.Control
											type="text"
											value={person.note}
											placeholder='Optional Notes'
											onChange={(e) => handlePersonChange(index, 'note', e.target.value)}
										/>
									</td> */}
								</tr>
							))}
						</tbody>
						<tfoot>
						<tr>
								<td className={grandTotal !== parseFloat(amount).toFixed(2) ? 'text-danger fw-bold' : ''}>
										{titleText && `${titleText} - `}Grand Total 
										{grandTotal !== parseFloat(amount).toFixed(2) && ` Amount differs from bill amount (${amount})`}
								</td>
								<td className={grandTotal !== parseFloat(amount).toFixed(2) ? 'text-danger fw-bold' : ''}>
										$ {grandTotal}
								</td>
								{/* <td></td> */}
						</tr>
						</tfoot>
					</Table>

					<div className="d-flex flex-wrap justify-content-center mb-4">
    <Button onClick={downloadImg} className="m-2">
        Share Split Amount
    </Button>

            {parseFloat(grandTotal)  < parseFloat(amount) && (
        <Button onClick={splitRemainderEqually} className="m-2">
            Split Remainder Equally
        </Button>
    )}
</div>


				</>

			}

			<datalist id="predefined-names">
				{predefinedNames.map((name, index) => (
					<option key={index} value={name} />
				))}
			</datalist>
		</Container>
	);
}
