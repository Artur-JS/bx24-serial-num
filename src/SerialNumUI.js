import React, { useState } from 'react';
import './serialnum.css';

const ProductsList = () => {
  const [dealId, setDealId] = useState('');
  const [products, setProducts] = useState([]);
  const [serialNumbers, setSerialNumbers] = useState({});

  const webhookUrlForProducts = 'https://bnzuz.bitrix24.kz/rest/19/kowry2sbip50j0g2/crm.deal.productrows.get.json';
  const webhookUrlForSerialNumbers = 'https://hook.eu1.make.com/t69b5ghkay4pgwc4eyrnu5u32f8d2c56';

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${webhookUrlForProducts}?ID=${dealId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data.result);
      const initialSerialNumbers = data.result.reduce((acc, product) => {
        acc[product.PRODUCT_ID] = '';
        return acc;
      }, {});
      setSerialNumbers(initialSerialNumbers);
    } catch (error) {
      console.error('Ошибка при запросе товаров сделки:', error);
    }
  };

  const handleSerialNumberChange = (productId, value) => {
    setSerialNumbers(prev => ({
      ...prev,
      [productId]: value
    }));
  };

  const submitSerialNumbers = async () => {
    const serialNumbersData = Object.entries(serialNumbers).map(([productId, serialNumber]) => ({
      itemNumber: productId,
      serialNumber
    }));

    try {
      const response = await fetch(webhookUrlForSerialNumbers, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dealId, serialNumbers: serialNumbersData })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (window.BX24) {
        window.BX24.showNotification('Серийные номера успешно отправлены!');
      } else {
        alert('Серийные номера успешно отправлены!');
      }

      setSerialNumbers({});
    } catch (error) {
      console.error('Ошибка при отправке серийных номеров:', error);
    }
  };

  return (
    <div className='main-screen'>
      <div className='title'>
        <h3>Введите ID сделки для регистрации серийных номеров</h3>
      </div>
      <div className='id-block'>
        <input
          type="text"
          value={dealId}
          onChange={(e) => setDealId(e.target.value)}
          placeholder="ID сделки"
          className='id-input'
        />
        <button className='load-btn' onClick={fetchProducts}>Загрузить</button>
      </div>
      {products.length > 0 && (
        <div className='deal-detail'>
          <h3>Детали сделки:</h3>
          <ul className='detail-list'>
            {products.map((product) => (
              <li key={product.PRODUCT_ID} className='product-item'>
                {product.PRODUCT_ID}: {product.PRODUCT_NAME}
                <input
                  type="text"
                  value={serialNumbers[product.PRODUCT_ID] || ''}
                  onChange={(e) => handleSerialNumberChange(product.PRODUCT_ID, e.target.value)}
                  placeholder="Серийный номер"
                  className='serial-input'
                />
              </li>
            ))}
          </ul>
          <button className='save-btn' onClick={submitSerialNumbers}>Отправить серийные номера</button>
        </div>
      )}
    </div>
  );
};

export default ProductsList;