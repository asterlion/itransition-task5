import React, { useState } from 'react';
import axios from 'axios';
import './RandomDataGenerator.css';

const RandomDataGenerator = () => {
    const [region, setRegion] = useState('');
    const [errors, setErrors] = useState(0);
    const [seed, setSeed] = useState('');
    const [page, setPage] = useState(1);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Функция для загрузки данных
    const loadData = async (pageNum) => {
        try {
            setIsLoading(true);
            const response = await axios.post('http://astreiko-itransition.online/generate', {
                region,
                errors,
                seed,
                page: pageNum,
                limit: 10,
            });
            setData((prevData) => [...prevData, ...response.data]);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateRandomSeed = async () => {
        try {
            const response = await axios.get('http://astreiko-itransition.online/random-seed');
            setSeed(response.data.seed);
        } catch (error) {
            console.error('Error generating random seed:', error);
        }
    };

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop === clientHeight && !isLoading) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadData(nextPage);
        }
    };

    const handleGenerate = async () => {
        setData([]);
        setPage(1);
        await loadData(1);
    };

    const exportToCSV = () => {
        const csvRows = [];
        const headers = ['#', 'UUID', 'Name', 'Address', 'Phone'];
        csvRows.push(headers.join(','));

        data.forEach((item, index) => {
            const row = [
                index + 1,
                item.uuid,
                item.name,
                item.address,
                item.phone,
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'generated_data.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="container mt-4">
            <h3 className="mb-4">Random Data Generator</h3>

            <div className="form-group d-flex align-items-center mb-3">
                <div className="input-group mr-2" >
                    <select
                        className="form-control"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                    >
                        <option value="">Select Language</option>
                        <option value="en">English</option>
                        <option value="de">Deutsch</option>
                        <option value="pl">Polski</option>
                    </select>
                </div>

                <div className="input-group mr-2">
                    <input
                        type="range"
                        className="slider"
                        min="0"
                        max="10"
                        step="0.25"
                        value={errors}
                        onChange={(e) => setErrors(e.target.value)}
                    />
                    <input
                        type="number"
                        className="form-control"
                        placeholder="Error Count"
                        min="0"
                        max="1000"
                        value={errors}
                        onChange={(e) => setErrors(e.target.value)}
                        inputMode="decimal"
                    />
                </div>

                <div className="input-group mr-2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Seed"
                        value={seed}
                        readOnly
                    />
                    <button
                        className="btn btn-secondary ml-2"
                        onClick={generateRandomSeed}
                    >
                        Random Seed
                    </button>
                </div>

                <div className="mx-2">
                    <button
                        className="btn btn-primary"
                        onClick={handleGenerate}
                    >
                        Generate
                    </button>
                </div>

                <div>
                    <button
                        className="btn btn-secondary mx-2"
                        onClick={exportToCSV}
                    >
                        Export&nbsp;CSV
                    </button>
                </div>
            </div>

            <div className="table-container" onScroll={handleScroll}>
                <table className="table table-striped">
                    <thead className="thead-dark">
                    <tr>
                        <th>#</th>
                        <th>UUID</th>
                        <th>Name</th>
                        <th>Address</th>
                        <th>Phone</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.map((item, index) => (
                        <tr key={item.uuid}>
                            <td>{index + 1}</td>
                            <td>{item.uuid}</td>
                            <td>{item.name}</td>
                            <td>{item.address}</td>
                            <td>{item.phone}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {isLoading && <div>Loading...</div>}
            </div>
        </div>
    );
};

export default RandomDataGenerator;
