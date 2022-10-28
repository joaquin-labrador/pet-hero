<?php

namespace DAO;

use DAO\OwnerDAOJson as OwnerDAO;
use Exception;
use Models\Pet;
use Models\Owner;
use Utils\Session;

class PetDAOJson implements IPetDAO
{
    /**
     * @var Pet[]
     */

    private array $petList = array();
    private string $fileName;
    private OwnerDAO $ownerDAO;

    public function __construct()
    {
        $this->fileName = ROOT . "/Data/pets.json";
        $this->ownerDAO = new OwnerDAO();
    }

    private function RetrieveData()
    {
        $this->petList = array();

        if (file_exists($this->fileName)) {
            $jsonContent = file_get_contents($this->fileName);

            $arrayToDecode = ($jsonContent) ? json_decode($jsonContent, true) : array();

            foreach ($arrayToDecode as $valuesArray) {
                $pet = new Pet();
                $pet->setId($valuesArray["id"]);
                $pet->setName($valuesArray["name"]);
                $pet->setAge($valuesArray["age"]);
                $pet->setSex($valuesArray["sex"]);
                $pet->setSpecies($valuesArray["species"]);
                $pet->setOwner($this->ownerDAO->GetById($valuesArray["ownerId"]));
                $pet->setBreed($valuesArray["breed"]);
                $pet->setImage($valuesArray["image"]);
                $pet->setVaccine($valuesArray["vaccine"]);
                array_push($this->petList, $pet);
            }
        }

    }

    private function SaveData()
    {
        $arrayToEncode = array();
        /**
         * @var Pet $pet
         */
        foreach ($this->petList as $pet) {
            $valuesArray["id"] = $pet->getId();
            $valuesArray["name"] = $pet->getName();
            $valuesArray["age"] = $pet->getAge();
            $valuesArray["sex"] = $pet->getSex();
            $valuesArray["species"] = $pet->getSpecies();
            $valuesArray["breed"] = $pet->getBreed();
            $valuesArray["ownerId"] = $pet->getOwner()->getId();
            $valuesArray["image"] = $pet->getImage();
            $valuesArray["vaccine"] = $pet->getVaccine();
            array_push($arrayToEncode, $valuesArray);
        }

        $jsonContent = json_encode($arrayToEncode, JSON_PRETTY_PRINT);

        file_put_contents($this->fileName, $jsonContent);
    }

    private function GetNextId()
    {
        $this->RetrieveData();
        $lastPet = end($this->petList);
        return $lastPet === false ? 0 : $lastPet->getId() + 1;
    }

    public function Add(Pet $pet, $image)
    {
        $this->RetrieveData();

        $pet->setId($this->GetNextId());

        try {
            $fileType = end(explode($image["name"], "."));
            $fileName = "photo-pet-" . $pet->getId() . "." . $fileType;
            $tempFileName = $image["tmp_name"];
            $filePath = UPLOADS_PATH . basename($fileName);

            $imageSize = getimagesize($tempFileName);

            if ($imageSize !== false) {
                if (move_uploaded_file($tempFileName, $filePath)) {
                    $pet->setImage($fileName);
                } else {
                    Session::Set("error", "Error uploading image");
                }
            } else {
                Session::Set("error", "File is not an image");
            }
        } catch (Exception $ex) {
            Session::Set("error", $ex->getMessage());
        }

        array_push($this->petList, $pet);

        $this->SaveData();
    }

    public function GetAll(): array
    {
        $this->RetrieveData();

        return $this->petList;
    }

    public function GetById(int $id): ?Pet
    {
        $this->RetrieveData();

        $owner = array_filter($this->petList, fn($pet) => $pet->getId() == $id);

        return array_shift($owner);
    }

    public function RemoveById(int $id): bool
    {
        $this->RetrieveData();

        $newList = array_filter($this->petList, fn($pet) => $pet->getId() != $id);

        $bool = count($newList) < count($this->petList);

        $this->petList = $newList;

        $this->SaveData();

        return $bool;

    }

    public function Update(Pet $pet): bool
    {
        $this->RetrieveData();

        foreach ($this->petList as $key => $value) {
            if ($value->getId() == $pet->getId()) {
                $this->petList[$key] = $pet;
                $this->SaveData();
                return true;
            }
        }
        return false;
    }

    public function GetOwnerId(int $petId): ?int
    {
        $this->petList = array();

        if (file_exists($this->fileName)) {
            $jsonContent = file_get_contents($this->fileName);

            $arrayToDecode = ($jsonContent) ? json_decode($jsonContent, true) : array();

            foreach ($arrayToDecode as $valuesArray) {
                if ($valuesArray["id"] == $petId) {
                    return $valuesArray["ownerId"];
                }
            }
        }
        return null;

    }

    public function GetPetsByOwnerId(int $ownerId): ?array
    {
        $this->RetrieveData();

        $petListByOwnerId = array_filter($this->petList, fn($pet) => $pet->getOwner()->getId() == $ownerId);

        return $petListByOwnerId;

    }
}